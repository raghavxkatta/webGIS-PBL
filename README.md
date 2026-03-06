# Prayagraj Village GIS Information System

A web based Geographic Information System that visualizes villages and important service locations in the Allahabad subdistrict of Prayagraj, Uttar Pradesh.

The system displays administrative boundaries, village locations, and public service landmarks on an interactive map. It allows users to search villages, toggle layers, filter services, and explore location specific information through popups.

This project demonstrates how modern web technologies can be used to build lightweight GIS portals for regional planning and public information systems.

---

## Project Overview

This application is a prototype GIS dashboard designed to visualize rural infrastructure and village level information.

The map provides:

Village level geographic visualization
Administrative boundary display
Service infrastructure mapping
Search and filtering of villages and landmarks
Interactive popups containing census style information

The system focuses on the Allahabad region of Prayagraj district and uses real geospatial formats such as GeoJSON to represent spatial data.

---

## Features

Interactive GIS map using Leaflet

Village layer with labeled locations

Administrative boundary overlay

Landmark categories such as:

* Bank Mitra
* Water Points
* Public Toilets
* Health Centres
* Schools
* Temples and Monuments
* ATMs

Search functionality for villages

Filter villages based on service availability

Layer toggles for villages, landmarks, and boundary

Basemap switching between OpenStreetMap and CARTO Light

Information popups displaying village and service details

Simple dashboard statistics showing number of villages and services

---

## Tech Stack

Frontend Framework
React

Styling
Tailwind CSS

Mapping Library
Leaflet

Build Tool
Vite

Data Format
GeoJSON

Deployment
Vercel

---

## Project Structure

```
src
│
├── components
│   └── Map.jsx
│
├── data
│   ├── villages.geojson
│   ├── boundary.geojson
│   └── landmarks.geojson
│
├── icons
│   ├── star.svg
│   ├── bank.svg
│   └── water.svg
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## Map Layers

### Village Layer

Displays village locations using star markers. Each village shows a label and popup containing census style information.

### Boundary Layer

Shows the administrative boundary of the Allahabad subdistrict.

### Landmark Layer

Displays important service locations such as banking services, water facilities, public utilities, and community infrastructure.

---

## Data Sources

The system uses GeoJSON files to represent geographic data.

villages.geojson
Contains village point coordinates and census attributes.

boundary.geojson
Contains the administrative boundary polygon for the region.

landmarks.geojson
Contains locations of public services and important landmarks.

---

## Installation

Clone the repository

```
git clone https://github.com/your-username/prayagraj-gis.git
```

Navigate to the project directory

```
cd prayagraj-gis
```

Install dependencies

```
npm install
```

Run the development server

```
npm run dev
```

The application will run locally at:

```
http://localhost:5173
```

---

## Deployment

This project can be easily deployed using Vercel.

Steps:

1. Push the repository to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect the Vite configuration
4. Deploy the project

After deployment the application will be accessible via a public URL.

---

## Future Improvements

Add marker clustering for dense datasets

Include more landmark categories such as hospitals, police stations, and transport hubs

Integrate real government spatial datasets

Add routing and navigation features

Support additional districts and administrative regions

Add analytics dashboards for infrastructure planning

---

## Purpose

The goal of this project is to demonstrate how web GIS systems can help visualize geographic data and improve access to public infrastructure information.

Such systems can support planning, monitoring, and public awareness of regional resources and services.

---

## Author

Developed as a Web GIS prototype for academic purposes.
