# miyagi

This is the monorepo for _miyagi_, a node based component development tool for JavaScript template engines.

It includes the source code for:

- Demos:
  - Web Components ([web-components.demos.miyagi.dev](https://web-components.demos.miyagi.dev)):<br>[/demos/web-components](/demos/web-components)
  - Handlebars ([handlebars.demos.miyagi.dev](https://handlebars.demos.miyagi.dev)):<br>[/demos/handlebars](/demos/handlebars)
- Docs ([docs.miyagi.dev](https://docs.miyagi.dev)): [/docs](/docs)
- Packages
  - core ([npmjs.com/package/@miyagi/core](https://npmjs.com/package/@miyagi/core)):<br>[/packages/core](/packages/core)
  - twig-drupal ([npmjs.com/package/@miyagi/twig-drupal](https://npmjs.com/package/@miyagi/twig-drupal)):<br>[/packages/twig-drupal](/packages/twig-drupal)

## core

[core](/packages/core) is the main package for _miyagi_ and should usually be sufficient. Please check out the [documentation](https://docs.miyagi.dev) for a full list of its features.

## twig-drupal

[twig-drupal](/packages/twig-drupal) is an extension which adds support for [Drupal attributes](https://www.drupal.org/docs/8/theming-drupal-8/using-attributes-in-templates) and other Drupal and twig functions and filters. For a full list of supported features, please refer to its [README](/packages/twig-drupal/README.md).
