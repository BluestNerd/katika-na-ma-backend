// ===== ENHANCED ROUTES/PORTFOLIOS.JS =====
const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Portfolio = require('../models/Portfolio');
const Artist = require('../models/Artist');
const router = express.Router();

/**
 * @swagger
 * /api/portfolios:
 *   post:
 *     summary: Create a new portfolio with enhanced template support
 *     tags: [Portfolios]
 */
router.post('/', async (req, res) => {
  try {
    const { artistId, template, title, description, sections, customizations } = req.body;

    // Verify artist exists
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const portfolio = new Portfolio({
      artist: artistId,
      template: template || 'modern',
      title,
      description,
      sections: sections || [],
      customizations: {
        colors: customizations?.colors || {
          primary: '#B026FF',
          secondary: '#ffffff',
          accent: '#FFD23F'
        },
        fonts: customizations?.fonts || {
          heading: 'Montserrat',
          body: 'Poppins'
        },
        layout: customizations?.layout || 'grid'
      }
    });

    await portfolio.save();

    // Update artist with portfolio reference
    artist.portfolio = portfolio._id;
    await artist.save();

    res.status(201).json({
      message: 'Portfolio created successfully',
      portfolio: await portfolio.populate('artist', 'name email category experience')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/portfolios/{id}/generate-pdf: