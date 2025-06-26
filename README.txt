Phantom by HTML5 UP
Modernization
-------------
This repository now contains a Next.js frontend (`frontend/`) and a Node backend (`backend/`) skeleton for future development. The original static site files remain for reference.

html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
Using this template
-------------------
1. Clone or download the repository.
2. Edit `index.html`, `projects.html`, `socials.html`, `gallery.html` and `contact.html` to replace the placeholder text with your own content.
3. Place your images in the `images` folder and update the paths in the HTML files.
4. Commit your changes and push to GitHub. The included workflow deploys to GitHub Pages.
Contact Form Setup
-------------------
A small Node.js server handles contact form submissions.
1. Run `npm install` to install dependencies.
2. Set environment variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `CONTACT_EMAIL`.
3. Start the server with `npm start`.

Forms in the HTML files post to `/contact` on this server.
This is Phantom, a simple design built around a grid of large, colorful, semi-interactive
image tiles (of which you can have as many or as few as you like). Makes use of some
SVG and animation techniques I've been experimenting with on that other project of mine
you may have heard about (https://carrd.co), and includes a handy generic page for whatever.

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.

(* = not included)

AJ
aj@lkn.io | @ajlkn


Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fontawesome.io)

	Other:
		jQuery (jquery.com)
		Responsive Tools (github.com/ajlkn/responsive-tools)
