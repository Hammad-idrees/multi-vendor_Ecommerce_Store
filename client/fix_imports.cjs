const fs = require('fs');
const path = require('path');

const root = 'src';

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            console.log(`Processing ${fullPath}`);
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix component paths - only if NOT already fixed
            content = content.replace(/components\/ProductCard(?!\/)/g, "components/product/ProductCard");
            content = content.replace(/components\/RatingStars(?!\/)/g, "components/common/RatingStars");
            content = content.replace(/components\/ReviewList(?!\/)/g, "components/product/ReviewList");
            content = content.replace(/components\/ReviewForm(?!\/)/g, "components/product/ReviewForm");
            content = content.replace(/components\/SearchBar(?!\/)/g, "components/common/SearchBar");
            content = content.replace(/components\/Header(?!\/)/g, "components/layout/Header");
            content = content.replace(/components\/Footer(?!\/)/g, "components/layout/Footer");
            content = content.replace(/components\/Sidebar(?!\/)/g, "components/layout/Sidebar");
            content = content.replace(/components\/Toast(?!\/)/g, "components/common/Toast");
            content = content.replace(/components\/AIAssistant(?!\/)/g, "components/common/AIAssistant");
            content = content.replace(/components\/ComparisonBar(?!\/)/g, "components/layout/ComparisonBar");
            content = content.replace(/components\/NotificationListener(?!\/)/g, "components/layout/NotificationListener");
            content = content.replace(/components\/ProtectedRoute(?!\/)/g, "components/auth/ProtectedRoute");
            content = content.replace(/components\/AdminRoute(?!\/)/g, "components/auth/AdminRoute");
            content = content.replace(/components\/SellerRoute(?!\/)/g, "components/auth/SellerRoute");
            content = content.replace(/components\/TopHeader(?!\/)/g, "components/layout/TopHeader");
            
            fs.writeFileSync(fullPath, content);
        }
    });
}

walk(root);
