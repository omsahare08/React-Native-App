# MyApp

A multi‑utility React Native application featuring user authentication and a collection of helpful tools:

- **Image compressor** with camera/gallery support
- **File manager** for photos & videos
- **Data visualizer** that converts JSON URLs into bar or pie charts
- **QR code scanner** that opens links directly
- **Barcode scanner** with product search or URL handling

Designed for learning and demonstration, this project is ready to be published on GitHub.

---

##  Features & Flow

1. **Authentication**
   - Users start on the **Login** screen or navigate to **Sign Up**.
   - Simple form validation (email format, password rules, matching passwords).
   - After a successful login/signup the user is taken to the **Home** dashboard.

2. **Home Dashboard**
   - Displays welcome message with user name (and email).
   - Six cards provide access to core modules:
     - Add Images
     - Add Files
     - Data Visualizer
     - Scan QR Code
     - Scan Barcode
   - A **Logout** button returns user to login screen.

3. **Add Images (Image Compressor)**
   - Choose between camera or gallery.
   - Selected photos are compressed to 800×800 JPEG and listed with original/compressed sizes.
   - Tap an image to view full screen, inspect details, or delete it.

4. **Add Files (Photo/Video Manager)**
   - Pick photos/videos from gallery or capture new photos.
   - Files show thumbnails, names, types, size, resolution, source, and date added.
   - Detailed bottom sheet provides metadata and deletion option.

5. **Data Visualizer**
   - Enter a JSON API URL (sample buttons available).
   - Choose between **Bar** or **Pie** chart.
   - Fetches data, parses common fields, and normalizes values for readability.
   - Displays interactive chart with ability to clear and view source link.

6. **QR Code Scanner**
   - Uses `react-native-vision-camera` for fast scanning.
   - Detects QR codes, validates URLs, and prompts user to open links.
   - Handles permission requests and absent camera gracefully.

7. **Barcode Scanner**
   - Supports a range of barcode types (EAN, UPC, Code‑128, etc.).
   - If scanned value is a URL it opens directly; otherwise offers Google search.
   - Similar permission/camera checks as QR module.

---

## Installation & Setup

> Make sure your environment is configured for React Native development. See the [official docs](https://reactnative.dev/docs/environment-setup).

```sh
# clone repository
git clone <your-repo-url>
cd MyApp

# install dependencies
npm install     # or yarn

# start Metro
npm start       # or yarn start

# run on device/emulator
npm run android # or npm run ios (after pod install)
```

Native modules such as `react-native-vision-camera`, `react-native-image-picker`, and chart libraries require proper linking. Always rebuild the project after adding new dependencies.

---

##  Project Structure

```
MyApp2/
├─ android/       # Android native project
├─ ios/           # iOS native project
├─ src/
│  └─ Home/       # Main screens (Login, Signup, Home, utilities...)
├─ __tests__/     # Jest tests
├─ package.json
└─ README.md      # ← you're reading it!
```

---

## Notes

- Authentication is simulated; replace with your backend logic as needed.
- JSON parsing in the Data Visualizer is heuristic and may not cover all shapes.
- Camera permission logic checks and prompts are basic; adjust per platform requirements.

---

Feel free to fork this repo, open issues, or submit pull requests. Happy coding! 
