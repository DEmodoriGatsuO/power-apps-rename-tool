# Power Apps Control Converter

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A modern web application that converts Power Apps classic controls to modern controls, preserving functionality while embracing the latest Power Apps features.

## Overview

Power Apps Control Converter is a specialized tool designed to help Power Apps developers easily migrate their classic controls to modern equivalents. The tool processes YAML source code from classic controls and transforms it into the corresponding modern control format, handling all the necessary property mappings and adding required modern properties.

## Key Features

- **Intuitive Interface**: A clean, modern UI with light and dark themes
- **YAML Conversion**: Accurately converts Power Apps-specific YAML format
- **Control Type Support**: Handles multiple control types including Label, Button, TextInput, and more
- **Property Mapping**: Intelligently maps properties between classic and modern controls
- **Detailed Logging**: Provides transparent conversion steps with detailed logs
- **Customizable Mappings**: Export and import mapping configurations
- **Responsive Design**: Works on desktop and mobile devices

## Supported Control Conversions

| Classic Control | Modern Control |
|-----------------|----------------|
| Label@2.5.1 | Text@0.0.50 |
| Classic/TextInput@2.3.2 | TextInput@0.0.53 |
| Classic/Button@2.2.0 | Button@0.0.44 |
| Classic/DropDown@2.3.1 | DropDown@0.0.44 |
| Classic/ComboBox@2.4.0 | ComboBox@0.0.49 |
| Classic/DatePicker@2.6.0 | DatePicker@0.0.42 |
| Classic/CheckBox@2.1.0 | CheckBox@0.0.27 |
| Classic/Radio@2.3.0 | Radio@0.0.24 |
| Classic/Toggle@2.1.0 | Toggle@1.1.4 |
| Classic/Slider@2.1.0 | Slider@1.0.31 |

## How to Use

1. Open the application in your web browser
2. Paste your Power Apps classic control YAML in the left input area
3. Click the "Convert" button to transform it to the modern control format
4. Review the conversion output and log details
5. Use "Copy" to copy the result to your clipboard or "Download" to save as a file

## Conversion Process

The converter handles several important aspects of the migration process:

1. **Control Type Mapping**: Maps classic control types to their modern equivalents
2. **Property Mapping**: Transforms properties from classic format to modern format
3. **Default Property Addition**: Adds required properties for modern controls that don't exist in classic controls
4. **Formula Expression Preservation**: Carefully maintains Power Apps formula expressions
5. **Reference Updates**: Updates all property references when control names change

## Technical Implementation

The converter consists of three main components:

1. **YAML Parser**: Specialized to handle Power Apps' unique YAML format, including formula expressions and control references
2. **Control Converter**: Implements the mapping logic between classic and modern controls
3. **User Interface**: Provides an intuitive interface for performing conversions

## Extending the Tool

You can extend the tool to support additional control types or customize property mappings:

1. Access the settings section
2. Export current mappings
3. Modify the JSON file to add or change mappings
4. Import your custom mappings

Custom mappings are saved in your browser's local storage for future use.

## Installation

### Method 1: GitHub Pages

Access the tool directly at [Power Apps Control Converter](https://yourusername.github.io/powerapps-control-converter/)

### Method 2: Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/powerapps-control-converter.git
   ```

2. Navigate to the project folder:
   ```bash
   cd powerapps-control-converter
   ```

3. Open index.html in your browser or start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

## Project Structure

- `index.html` - Main HTML file
- `css/styles.css` - Stylesheet with light/dark theme support
- `js/app.js` - Main application logic
- `js/parser.js` - YAML parsing functionality
- `js/converter.js` - Conversion logic for control types and properties

## License

MIT

## Disclaimer

This tool is created to assist Power Apps developers in converting classic controls to modern controls. While it covers many control types and properties, it may not support all possible scenarios. Always review the converted output before using it in your production applications.