import { Request, Response } from 'express';
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Successfully connected to database');
    // Check if tables exist
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
  })
  .then((result: { rows: any[] }) => {
    console.log('Available tables:', result.rows);
    // Check docentes_form_submissions table structure
    return pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'docentes_form_submissions'
    `);
  })
  .then((result: { rows: any[] }) => {
    console.log('docentes_form_submissions table structure:', result.rows);
  })
  .catch((err: Error) => {
    console.error('Error checking database:', err);
    process.exit(1);
  });

// API endpoint to search for school names
app.get('/api/schools', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search as string || '';
    const query = `
      SELECT DISTINCT nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ as name
      FROM rectores
      WHERE LOWER(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_) 
      LIKE LOWER($1)
      ORDER BY name;
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    res.json(result.rows.map((row: { name: string }) => row.name));
  } catch (error) {
    console.error('Error fetching school names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to submit forms
app.post('/api/submit-form', async (req: Request, res: Response) => {
  try {
    const { formType, ...formData } = req.body;
    console.log('Received form submission:', { formType, formData });

    // First check if the table exists and its structure
    const tableCheckQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'docentes_form_submissions';
    `;
    
    const tableStructure = await pool.query(tableCheckQuery);
    console.log('Table structure:', tableStructure.rows);

    let query;
    let values;

    switch (formType) {
      case 'docentes':
        query = `
          INSERT INTO docentes_form_submissions (
            institucion_educativa,
            anos_como_docente,
            grados_asignados,
            jornada,
            retroalimentacion_de,
            comunicacion,
            practicas_pedagogicas,
            convivencia
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;
        `;
        values = [
          formData.schoolName,
          formData.yearsOfExperience,
          [...formData.teachingGradesEarly, ...formData.teachingGradesLate],
          formData.schedule,
          formData.feedbackSources,
          formData.comunicacion,
          formData.practicas_pedagogicas,
          formData.convivencia
        ];
        console.log('Docentes query:', query);
        console.log('Docentes values:', values);
        break;

      case 'estudiantes':
        query = `
          INSERT INTO estudiantes_form_submissions (
            institucion_educativa,
            anos_estudiando,
            grado_actual,
            jornada,
            comunicacion,
            practicas_pedagogicas,
            convivencia
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id;
        `;
        values = [
          formData.schoolName,
          formData.yearsInSchool,
          formData.currentGrade,
          formData.schedule,
          formData.comunicacion,
          formData.practicas_pedagogicas,
          formData.convivencia
        ];
        break;

      case 'acudientes':
        query = `
          INSERT INTO acudientes_form_submissions (
            institucion_educativa,
            grados_estudiantes,
            comunicacion,
            practicas_pedagogicas,
            convivencia
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id;
        `;
        values = [
          formData.schoolName,
          formData.studentGrades,
          formData.comunicacion,
          formData.practicas_pedagogicas,
          formData.convivencia
        ];
        break;

      default:
        return res.status(400).json({ error: 'Invalid form type' });
    }

    const result = await pool.query(query, values);
    console.log('Query result:', result.rows[0]);
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add catch-all route for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 