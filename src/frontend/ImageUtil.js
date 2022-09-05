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
    // GIF support (only if GIF class/function exists and imageRaw is a url)
    if (typeof GIF !== "undefined" && typeof imageRaw === "string") {
      return new Promise((resolve) => {
        const gif = GIF(); // creates a new gif
        gif.onerror = async () => {
          // the image was not loadable as a gif, so try it as normal image
          const finalImage = await this._loadImage(imageRaw);
          resolve({ image: () => finalImage });
        };

        // when the image was a gif and loaded correctly:
        gif.onload = () => {
          resolve({
            image: () => {
              // and it's done loading completely
              if (!gif.loading) {
                // draw that next frame
                return gif.image;
              }
              // if it is not loaded completely, but there is a last
              // frame (= partly loaded)
              if (gif.lastFrame !== null) {
                // then draw that last frame again
                return gif.lastFrame.image;
              }
              // otherwise nothing can be drawn
              return null;
            },
          });
        };
        gif.load(imageRaw);
      });
    }

    const finalImage = await this._loadImage(imageRaw);
    return { image: () => finalImage };
  }
}
