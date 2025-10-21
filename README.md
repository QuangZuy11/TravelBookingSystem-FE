# Travel Booking System - Frontend

A modern travel booking platform built with React + Vite.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

---

## ⚠️ Important: Google Drive Image Issues

### Current Issue
Backend is storing Google Drive URLs in database, causing **403 Forbidden** errors due to CORS policy.

### ✅ Quick Fix - Use Backend Proxy (8 minutes)

**Step 1:** Add proxy route to backend
```bash
# See: docs/BACKEND_PROXY_SOLUTION.js
# Copy imageProxy.js to backend/routes/
```

**Step 2:** Use the new utility helper
```javascript
// In your components:
import { getProxiedGoogleDriveUrl } from '@/utils/googleDriveImageHelper';

<img src={getProxiedGoogleDriveUrl(imageUrl)} alt="Hotel" />
```

**Step 3:** See working example
```javascript
// Check: src/components/examples/GoogleDriveImageExample.jsx
```

### 📚 Available Utilities

**Simple Usage:**
```javascript
import { getProxiedGoogleDriveUrl } from '@/utils/googleDriveImageHelper';

// Single image
<img src={getProxiedGoogleDriveUrl(url)} alt="Hotel" />

// Multiple images
import { getProxiedGoogleDriveUrls } from '@/utils/googleDriveImageHelper';
{getProxiedGoogleDriveUrls(hotel.images).map(url => <img src={url} key={url} />)}
```

### Detailed Guides
- ⚡ **[CORS_FIX_QUICK_START.md](./CORS_FIX_QUICK_START.md)** - Quick start (8 min)
- � **[docs/BACKEND_PROXY_SOLUTION.js](./docs/BACKEND_PROXY_SOLUTION.js)** - Backend code
- 🎯 **[src/utils/googleDriveImageHelper.js](./src/utils/googleDriveImageHelper.js)** - Frontend utilities
- 📝 **[src/components/examples/GoogleDriveImageExample.jsx](./src/components/examples/GoogleDriveImageExample.jsx)** - Usage examples

---

## 📚 Documentation

### Image Handling
- 📄 **[GOOGLE_DRIVE_FIX_SUMMARY.md](./GOOGLE_DRIVE_FIX_SUMMARY.md)** - Quick fix for 403 errors
- 📄 **[docs/GOOGLE_DRIVE_IMAGE_GUIDE.md](./docs/GOOGLE_DRIVE_IMAGE_GUIDE.md)** - Complete guide
- 📄 **[docs/BACKEND_IMAGE_UPLOAD_FIX.md](./docs/BACKEND_IMAGE_UPLOAD_FIX.md)** - Backend migration guide

### AI & Features
- 📄 **[docs/AI_ITINERARY_*.md](./docs/)** - AI itinerary documentation
- 📄 **[docs/POI_SELECTION_GUIDE.md](./docs/POI_SELECTION_GUIDE.md)** - POI selection guide
- 📄 **[docs/REORDER_ACTIVITIES_FLOW.md](./docs/REORDER_ACTIVITIES_FLOW.md)** - Activity reordering

### Bug Fixes
- 📄 **[BACKEND_FIX_REQUIRED.md](./BACKEND_FIX_REQUIRED.md)** - Backend issues
- 📄 **[docs/*_FIX.md](./docs/)** - Various bug fixes

---

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ai/              # AI itinerary components
│   ├── common/          # Shared components
│   ├── layout/          # Layout components
│   ├── provider/        # Provider-specific components
│   └── tour/            # Tour-related components
├── pages/               # Page components
├── services/            # API services
├── utils/               # Utility functions
│   └── googleDriveHelper.js  # Google Drive URL helper
├── contexts/            # React contexts
└── hooks/               # Custom hooks
```

---

## 🔧 Development

### Environment Setup
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Available Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Testing Google Drive Images
Use the debugger component:
```javascript
import { GoogleDriveDebugger } from './components/common/GoogleDriveDebugger';

// Add to any page temporarily
<GoogleDriveDebugger />
```

---

## 🐛 Known Issues

### 1. Google Drive 403 Forbidden
**Issue:** Images from Google Drive show 403 error  
**Cause:** Files not publicly shared  
**Fix:** Share files as "Anyone with the link" OR migrate to Cloudinary  
**Docs:** [GOOGLE_DRIVE_FIX_SUMMARY.md](./GOOGLE_DRIVE_FIX_SUMMARY.md)

### 2. CORS Policy Errors
**Issue:** CORS blocking Google Drive images  
**Cause:** Google Drive CORS restrictions  
**Fix:** Use Cloudinary/AWS S3 instead  
**Docs:** [docs/BACKEND_IMAGE_UPLOAD_FIX.md](./docs/BACKEND_IMAGE_UPLOAD_FIX.md)

---

## 🎯 Recommended Next Steps

1. ✅ **Fix Google Drive sharing** (Quick - 2 minutes)
2. ⏰ **Setup Cloudinary** (This week - 30 minutes)
3. 🔄 **Migrate existing images** (When ready)

See [docs/BACKEND_IMAGE_UPLOAD_FIX.md](./docs/BACKEND_IMAGE_UPLOAD_FIX.md) for implementation guide.

---

## 📞 Support

For questions or issues:
- Check `/docs` folder for guides
- Review error logs in browser console
- Use GoogleDriveDebugger component for image issues

---

## 📝 Vite Configuration

This template uses Vite with React for fast development:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) - Uses Babel for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - Uses SWC for Fast Refresh

### ESLint Configuration

For production applications, we recommend TypeScript with type-aware lint rules. See the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for more info.

---

**Last Updated:** October 21, 2025

