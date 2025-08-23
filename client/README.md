# GREYSTAR TRUST FUND Energy Company Website

A modern, responsive React website for GREYSTAR TRUST FUND Energy, built with Vite and Tailwind CSS. This project recreates the design and functionality of the original GREYSTAR TRUST FUND Energy website with clean, maintainable code and modern web technologies.

## Features

- **Modern React Architecture**: Built with functional components and hooks
- **Responsive Design**: Fully responsive layout that works on all devices
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Clean Energy Theme**: Professional design focused on renewable energy
- **Interactive Components**: Contact forms, navigation, and smooth scrolling
- **Performance Optimized**: Fast loading and smooth animations

## Components

### Header

- Responsive navigation with mobile menu
- Sticky header design
- Call-to-action button

### Hero Section

- Eye-catching hero with gradient background
- Key statistics and metrics
- Interactive energy dashboard mockup

### About Section

- Company information and values
- Feature highlights with icons
- Team statistics

### Services Section

- Service cards with gradients and icons
- Process timeline
- Detailed service descriptions

### Contact Section

- Contact form with validation
- Contact information display
- Map placeholder

### Footer

- Comprehensive site links
- Social media links
- Newsletter signup
- Company information

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Rubik, Roboto, Poppins)
- **Icons**: Heroicons (via SVG)

## Installation

1. **Prerequisites**: Node.js 20.19.0 or higher

2. **Clone and Install**:

   ```bash
   cd GreyStar
   npm install
   ```

3. **Development**:

   ```bash
   npm run dev
   ```

4. **Build for Production**:

   ```bash
   npm run build
   ```

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
GreyStar/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Customization

### Colors

The primary color scheme uses blue tones. To customize:

1. Update the `primary` colors in `tailwind.config.js`
2. Modify gradient classes in components
3. Update CSS custom properties in `App.css`

### Content

To update content:

1. Edit text directly in component files
2. Modify service offerings in `Services.jsx`
3. Update contact information in `Contact.jsx` and `Footer.jsx`

### Styling

- Tailwind classes are used throughout for consistency
- Custom CSS is minimal and contained in `App.css`
- All animations and interactions are CSS-based

## Performance Features

- **Lazy Loading**: Components load efficiently
- **Optimized Images**: Placeholder elements for better UX
- **Smooth Scrolling**: CSS scroll-behavior for navigation
- **Responsive Images**: Proper sizing for all devices
- **Minimal Bundle**: Only necessary dependencies included

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

The project can be deployed to any static hosting service:

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Vercel

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### GitHub Pages

```bash
npm run build
# Configure GitHub Pages to serve from dist/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for demonstration purposes. Please ensure you have proper licensing for any production use.

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.

---

**Note**: This project was created as a modern recreation of the GREYSTAR TRUST FUND Energy website using React, Vite, and Tailwind CSS. It demonstrates best practices in modern web development while maintaining the original design intent.
