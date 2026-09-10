import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const enquiriesFile = join(dataDir, 'enquiries.json');

// Initialize enquiries file if not exists
if (!existsSync(enquiriesFile)) {
  writeFileSync(enquiriesFile, JSON.stringify([], null, 2));
}

// API Routes
// POST /api/enquiry - Handle lead form submissions
app.post('/api/enquiry', (req, res) => {
  try {
    const { name, phone, city, message, requirement } = req.body;

    // Validation
    if (!name || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and city are required fields.'
      });
    }

    // Validate phone (basic 10-digit check)
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit phone number.'
      });
    }

    // Create enquiry record
    const enquiry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      message: (message || requirement || '').trim(),
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'direct',
      ip: req.ip
    };

    // Read existing enquiries
    let enquiries = [];
    try {
      const data = readFileSync(enquiriesFile, 'utf8');
      enquiries = JSON.parse(data);
    } catch {
      enquiries = [];
    }

    // Add new enquiry
    enquiries.push(enquiry);

    // Save to file
    writeFileSync(enquiriesFile, JSON.stringify(enquiries, null, 2));

    console.log(`✅ New enquiry from: ${enquiry.name} (${enquiry.city}) - ${enquiry.phone}`);

    // TODO: Add Nodemailer email notification here
    // Configure with your SMTP credentials:
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
    // });
    // await transporter.sendMail({
    //   from: 'your-email@gmail.com',
    //   to: 'info@fiabxpharma.com',
    //   subject: `New Franchise Enquiry from ${enquiry.name}`,
    //   html: `<h2>New Enquiry</h2>
    //          <p><strong>Name:</strong> ${enquiry.name}</p>
    //          <p><strong>Phone:</strong> ${enquiry.phone}</p>
    //          <p><strong>City:</strong> ${enquiry.city}</p>
    //          <p><strong>Message:</strong> ${enquiry.message}</p>`
    // });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been submitted. Our team will contact you shortly.'
    });

  } catch (error) {
    console.error('❌ Error saving enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again or call us directly.'
    });
  }
});

// GET /api/enquiries - List all enquiries (admin use)
app.get('/api/enquiries', (req, res) => {
  try {
    const data = readFileSync(enquiriesFile, 'utf8');
    const enquiries = JSON.parse(data);
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch {
    res.json({ success: true, count: 0, data: [] });
  }
});

// Serve React build in production
const clientDist = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`
  🌿 Fibax Pharma Server
  ========================
  🚀 Server running on: http://localhost:${PORT}
  📋 API endpoint:      POST http://localhost:${PORT}/api/enquiry
  📊 View enquiries:    GET  http://localhost:${PORT}/api/enquiries
  ========================
  `);
});
