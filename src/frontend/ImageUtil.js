export { ImageUtil };

import { GifReader } from "./GIF.js";

// written by para >:( asshole
// a class that handles images in the game
// can handle both images that need to have a colorable mask on top (like character sprites with colored cloaks)
// and simple images like emotes

class ImageUtil {
  // loads image and returns it as promise
  async _loadImage(imageRaw) {
    // if the imageRaw variable doesn't hold a path to the image,
    // then the function returns whatever that variable holds
    // ><?
    if (typeof imageRaw !== "string") {
      return imageRaw;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = imageRaw;
    });
  }

  async _loadGif(src) {
    const data = await fetch(src)
      .then((r) => r.arrayBuffer())
      .then((img) => new Uint8Array(img));
    console.log(data);
    const reader = new GifReader(data);
    const pixels = new Uint8ClampedArray(reader.width * reader.height);
    reader.decodeAndBlitFrameRGBA(0, pixels);
    const finalImage = createImageBitmap(new ImageData(pixels, reader.width, reader.height));
    return { image: () => finalImage };

    // NOTE: you can extract all frames like so, in case you want to ever actually animate the emotes
    // const frames = [];
    // for (let i = 0, len = reader.numFrames(); i < len; ++i) {
    //   const pixels = new Uint8ClampedArray(reader.width * reader.height);
    //   reader.decodeAndBlitFrameRGBA(i, pixels);
    //   const { delay } = reader.frameInfo(i);
    //   frames.push({ delay, pixels })
    // }
  }

  // the new canvas will be as big as the image itself
  _createCanvas(width, height) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }

  // sprite with colored mask
  // three things need to go inside: the sprite, the mask of the sprite (the cloak), and the color it's supposed to be painted
  async asMaskedDrawable(imageRaw, maskRaw, color) {
    // wait to load the sprite and its mask
    const image = await this._loadImage(imageRaw);
    const mask = await this._loadImage(maskRaw);

    //create a new freakin canvas
    const c = this._createCanvas(image.width, image.height);
    const ctx = c.getContext("2d"); // as CanvasRenderingContext2D

    // mask shenanigans
    ctx.save();
    ctx.drawImage(mask, 0, 0);
    ctx.fillStyle = color;
    ctx.globalCompositeOperation = "source-in";
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    // image bitmap? wut
    const finalImage = await createImageBitmap(c);

    //
    return { image: () => finalImage };
  }

  async asDrawable(imageRaw) {
    try {
      // attempt loading the image as gif
      // NOTE: this is a hack, and you should instead infer the image type from the request headers
      return await ImageUtil._loadGif(imageRaw);
    } catch (_) {
      // otherwise load it as static
      const finalImage = await this._loadImage(imageRaw);
      return { image: () => finalImage };
    }
  }
}
