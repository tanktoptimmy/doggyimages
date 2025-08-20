# Dog JSON Object Generator from Wikimedia URLs

This guide explains how to create a structured JSON object list from Wikimedia Commons URLs of dog images. The resulting objects can be used in applications that require metadata about dog breeds, images, authorship, and licensing.

## Example JSON Object

Each dog object should follow this structure:

```json
{
  "title": "Boston Terrier Adulto",
  "breed": "Boston Terrier",
  "type": "Non-sporting",
  "author": "Bodhi141",
  "authorUrl": "https://commons.wikimedia.org/wiki/User:Bodhi141",
  "license": "Creative Commons Attribution-ShareAlike 3.0 Unported",
  "uploadDate": "2010-02-14",
  "source": "Own work",
  "originalUrl": "https://commons.wikimedia.org/wiki/File:Boston_Terrier_Adulto.png"
}
```

## Instructions

### 1. Collect Wikimedia URLs

Make a list of Wikimedia Commons URLs for the dog images you want to include. Example URLs:

- [Boston Terrier Adulto](https://commons.wikimedia.org/wiki/File:Boston_Terrier_Adulto.png)
- [Cairn Terrier - 002](https://commons.wikimedia.org/wiki/File:Cairn_Terrier_-_002.jpg)

---

### 2. Use ChatGPT to Fill Metadata Automatically

Provide the list of URLs to ChatGPT and ask it to generate JSON objects with all fields filled in.

#### Example Prompt for ChatGPT

I have the following list of Wikimedia Commons URLs for dog images:

https://commons.wikimedia.org/wiki/File:Boston_Terrier_Adulto.png
https://commons.wikimedia.org/wiki/File:Cairn_Terrier_-_002.jpg

Please generate a JSON array of objects with the following structure:
```json
{
  "title": "Full image title",
  "breed": "Dog breed",
  "type": "Dog type (Sporting, Terrier, Non-Sporting, etc.)",
  "author": "Author's name",
  "authorUrl": "URL of the author's Wikimedia profile",
  "license": "License type",
  "uploadDate": "YYYY-MM-DD",
  "source": "Source of the image, e.g., Own work",
  "originalUrl": "The Wikimedia file page URL"
}
```
Use the information on the Wikimedia pages to fill in each field accurately. Provide the JSON array as the output, without any additional text.


---

### 3. Run the Downloader Script

Once you have your JSON blobs, run downloadAndResizeDogImages.ts to download the images.

By default, the images will be resized to 800px wide and 600px tall, maintaining proportions. If the image is smaller in one dimension, it will either:

- Default mode (cover): Scale proportionally so the image fills the entire width and height, cropping excess from the center.

- Optional contain mode: Scale proportionally so the whole image fits within the width and height, adding white padding if needed.

You can override the size, format, or mode using command-line arguments or environment variables.

#### 3a. Using Default Size, Format, and Mode

```bash
npm start
```

#### 3b. Passing Custom Width, Height, Format, and Mode

```bash
npm start -- 1024 768 jpg contain
```

Here:

- 1024 = width in pixels
- 768 = height in pixels
- jpg = output format (default is webp)
- contain = mode (default is cover, can be contain for white padding)

#### 3c. Using Environment Variables (Optional)

```bash
IMG_WIDTH=1024 IMG_HEIGHT=768 IMG_FORMAT=jpg IMG_MODE=contain npm start
```
# Notes

- Images are downloaded to the ./images folder.
- Filenames are generated from the dog breed, with spaces replaced by underscores.
- The script maintains image proportions to avoid distortion.
- If the image is smaller than the target size, white padding is added to meet the desired width/height.
- Logs both original and processed dimensions for each image.
- Default output format is WebP, optionally JPEG via IMG_FORMAT=jpg.
