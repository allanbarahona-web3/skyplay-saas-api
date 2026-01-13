import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  @Get('logo')
  async getLogo(@Query('url') url: string, @Res() res: Response) {
    try {
      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send('Error fetching image');
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = await response.arrayBuffer();

      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Error proxying image:', error);
      res.status(500).json({ error: 'Error fetching image' });
    }
  }
}
