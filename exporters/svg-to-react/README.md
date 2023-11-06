![SVG to React Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/svg-to-react/resources/header.png)

# SVG to React Exporter

The SVG to React Exporter is an efficient package tailored to transform your SVG icons into dynamic React components. Bridging the gap between design and development, this package ensures that your SVG icons can be effortlessly utilized within your React applications. Here are the features and configurations that the SVG to React Exporter brings to the table:

## Exporter Features

This exporter package offers a range of functionalities, allowing developers to:

- **Brand Support:** Export SVGs from various brands defined in Supernova.
- **Scale SVGs:** Export SVGs at various sizes from their original dimension.
- **Optimize SVGs:** Utilize the SVGO plugin to trim down SVG sizes by eliminating redundant attributes.
- **Generate TypeScript or JavaScript Definitions:** Flexibility to choose between TypeScript or standard JavaScript.
- **Preserve Original SVGs:** Maintain the original SVGs alongside the converted React components.
- **Use Custom Templates:** Possibility to use custom templates for the generated components and index files.
- **Replace Values:** Replace specific values within the SVGs during export.
- **Exclude Certain Assets:** Specify assets or folders that should not be exported.

## Configuration Options

Here is a list of all the configuration options this exporter provides:

- **svgScale:** Choose the scale for the SVGs with options including x1 (default/original size), x2, x3, and x4.
  
- **optimize:** A toggle to enable optimization of SVGs using the SVGO plugin.
  
- **svgoOptions:** Configure the SVGO plugin as per your requirements. For an exhaustive list of options, visit [SVGO GitHub Repository](https://github.com/svg/svgo).
  
- **typescript:** Toggle to decide between TypeScript and JavaScript definitions for the generated components.
  
- **keepOriginalSvgs:** Option to retain the original SVG files in the output.
  
- **originalSvgFolder:** Define the directory where the original SVGs are stored. This option is disregarded if the original SVGs aren't part of the output.
  
- **componentFolder:** Designate the directory to store the generated React components.
  
- **customComponentTemplate:** Enable the usage of custom templates for React components over the default ones.
  
- **componentTemplate:** Define the structure and format of the React component template.
  
- **generateIndex:** Decide if an index file for the React components should be created.
  
- **customIndexTemplate:** Opt to use a custom template for the generated index file over the default template.
  
- **indexTemplate:** Define the structure and format of the index file template.
  
- **replaceValues:** Provide key-value pairs to replace specific values within the SVGs during the export process.
  
- **ignoredAssetPaths:** List out specific paths or folders that should be excluded during the export. Including partial path fragments can exclude multiple matching paths (e.g., specifying `icons` will exclude all icons within the `icons/` directory and its subdirectories).
