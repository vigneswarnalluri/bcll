import fs from 'fs';
import https from 'https';
import path from 'path';

// Pexels: Volunteers working
const url = "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4";
const dest = path.join(process.cwd(), 'public', 'hero.mp4');

const file = fs.createWriteStream(dest);
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

const handleResponse = (response) => {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => console.log('Download completed successfully.'));
        });
    } else if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, options, handleResponse);
    } else {
        console.error(`Download failed. Status code: ${response.statusCode}`);
        fs.unlink(dest, () => { });
    }
};

https.get(url, options, handleResponse).on('error', (err) => {
    fs.unlink(dest, () => { });
    console.error(`Error: ${err.message}`);
});
