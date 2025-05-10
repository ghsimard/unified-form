import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// API endpoint to search for school names
app.get('/api/schools', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search as string || '';
    console.log('Searching for schools with term:', searchTerm);
    
    // First, let's check if we have any data in the table
    const countQuery = 'SELECT COUNT(*) FROM rectores';
    const countResult = await pool.query(countQuery);
    console.log('Total records in rectores table:', countResult.rows[0].count);
    
    // Get a sample of the data to see what we have
    const sampleQuery = `
      SELECT DISTINCT nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ as name
      FROM rectores
      WHERE nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ IS NOT NULL
      LIMIT 5;
    `;
    const sampleResult = await pool.query(sampleQuery);
    console.log('Sample of school names in database:', sampleResult.rows);
    
    // Modified query to be more flexible with the search
    const query = `
      SELECT DISTINCT nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ as name
      FROM rectores
      WHERE nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ IS NOT NULL
      AND LOWER(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_) 
      LIKE LOWER('%' || $1 || '%')
      ORDER BY name;
    `;
    
    console.log('Executing query:', query);
    const result = await pool.query<{ name: string }>(query, [searchTerm]);
    console.log('Query result:', result.rows);
    
    res.json(result.rows.map(row => row.name));
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

    const result = await pool.query<{ id: number }>(query, values);
    const insertedId = result.rows[0]?.id;
    if (!insertedId) {
      throw new Error('Failed to get inserted ID');
    }
    res.json({ success: true, id: insertedId });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Test database connection
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Successfully connected to database');
      
      // List available tables
      pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `, (err, res) => {
        if (err) {
          console.error('Error listing tables:', err);
        } else {
          console.log('Available tables:', res.rows);
          
          // Get rectores table structure
          pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'rectores'
          `, (err, res) => {
            if (err) {
              console.error('Error getting table structure:', err);
            } else {
              console.log('rectores table structure:', res.rows);
            }
          });
        }
      });
    }
  });
}); 