# Astro Starter Kit: Minimal

## Navigation and sharing

The menu starts collapsed and remembers the user's toggle preference.
URL options override that preference:

- `?menu=hidden` completely hides the sidebar and its toggle for that page.
- `?embed=tool` shows only the interactive tool, filling the viewport with no
  sidebar, page header, outer margins, or frame border. It works on every live
  tool page; home and coming-soon pages keep their regular layout.
- `?menu=expanded` opens the menu; `?menu=collapsed` collapses it.
- Existing `?embed=1` links continue to collapse the menu.

Every page has a **Copy URL** button at the right of its breadcrumb row
(or beside the heading on the home page). It copies
the current URL with `menu=hidden`, preserving other query parameters and the
anchor (and removing the legacy `embed` option). A brief **Copied!** message
confirms success. Hidden mode does not change the saved menu preference.

For example, embed Color Models with
`/my-tools/tools/color-models?embed=tool`. This mode also leaves saved menu
preferences unchanged. New live tool pages should pass `toolPage` to `Layout`
and use the shared `tool-page`, `tool-page-header`, and `tool-frame` classes
on their shell, header, and interactive container, respectively.

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
