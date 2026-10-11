# Verity.
**Find your people. Find your place.**

Verity is a mobile-first web application designed to help Georgia State University (GSU) students discover opportunities, navigate campus spaces, and feel connected to their university community.

## Problem
Campus event information can be scattered across multiple platforms, making it difficult for students to discover opportunities and get involved. New students may also be unfamiliar with campus locations or unsure where activities take place.

## Our Solution
Verity aims to make campus involvement more accessible by bringing event discovery, campus exploration, and social connection into one mobile-first application.

Students can discover opportunities that match their interests, save activities for later, and explore where events take place. Our Friends prototype also demonstrates how social features could help students connect through shared interests.

By simplifying access to campus information, Verity aims to reduce barriers to participation and help students feel more connected to their university community.

## Demo Video
Link: https://youtube.com/shorts/vGezZmnH00s?feature=share

## Main Features
### Event Discovery
* Browse campus events on the Home page.
* Filter events by Social, Academic, Career, and Wellness categories.
* Search for events by name, location, category, or description.
* Open event details to view dates, times, locations, and descriptions.
### Campus Map 
* View a campus map within a mobile-friendly interface.
* Search for campus buildings by name or alias.
* Discover events associated with specified campus locations.
* Expand or collapse an events panel to switch between viewing the map and browsing events.
### Saved Events
* Save or unsave events and view them on the Saved page. 
* Mark events as Interested or Going as a personal planning aid; these are not official RSVPs.
### Friends Demo
* Explore a prototyped Friends interface with fictional student profiles.
* Search for sample students, send simulated friend requests, and accept or decline demonstration requests.
* View sample friend avatars and activity to illustrate future social discovery.
* This is a frontend demonstration, not a live student directory or cross-account friend network.
### Authentication
* Sign in and log out using Auth0.
* Authentication is currently basic; saved events and demo friend relationships are not synced to user accounts.
### Responsive Design
* Mobile-first layout designed to resemble a phone application.
* Bottom navigation for Home, Map, and Saved pages.
* Pastel visual design and interactive event cards.

## Technologies Used
* React + JSX: Interactive frontend user interface and components.
* Vite: Development server and build tooling
* JavaScript: Application logic, filtering, navigation, and UI behavior.
* CSS: Styling, responsive layout, and interface design.
* Material UI Icons: Interface iconography
* Auth0: Basic authentication.
* Browser localStorage: Browser-based storage for saved events.
* Git & GitHub: Version control and team collaboration.
* Canva: Custom map design and visual editing.
* Claude AI: AI-assisted development.


## Run Locally
**Prerequisites:** Install Node.js and npm. Auth0 configuration is required for the login flow.

### Installation

1. Clone the repository.

```bash
git clone https://github.com/aacoleyy/team-verity.git
```

2. Navigate into the project directory.

```bash
cd team-verity
```

3. Install dependencies.

```bash
npm install
```

4. Create a local `.env` file for the Vite frontend using the Auth0 values provided by the team (do not commit credentials):

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

Confirm the variable names against src/main.jsx before running; Auth0 audience or redirect settings may also be required by the project's configuration. Add the local development URL to the allowed callback, logout, and web-origin settings in Auth0 as appropriate.

5. Start the development server.

```bash
npm run dev
```

6. Open the local URL displayed in your terminal.

For example: **http://localhost:5173/**

The application will open in your web browser.


## Data Sources & Attribution
* Event data: The current prototype references publicly available campus event information from Georgia State University's Panther Involvement Network (PIN). 
* Campus buildings: Building names and campus locations are used to support location-based event discovery.
* Campus map: Original, custom-designed map created by Team Verity using campus imagery as visual references, Claude AI assistance, and manual editing in Canva.
* Demo friends: Fictional student profiles and simulated activity; no real student directory is connected.

## Current Limitations
* No live Panther Involvement Network (PIN) integration.
* Event information currently relies on manually entered data rather than automatically updated event listings, meaning it will become outdated without a live data source.
* Friends search, requests, and activity are simulated with fictional profiles and do not communicate between real student accounts.
* Saved events and event plans use browser localStorage, not account-based cloud synchronization.
* Auth0 provides basic sign-in/sign-out, but full personalized account functionality is not implemented.
* The events panel supports button-based expansion rather than full drag/swipe interaction.
* The campus map's interactive building selection is still being developed.

## Future Improvements
* Live PIN integration
* Fully interactive 3D campus map with directions. 
* Real student profiles, opt-in friend requests, and privacy-controlled shared plans.
* Cross-device syncing of saved events and preferences.
* Event reminders and calendar integration.
* Optional exploration challenges, badges, and customizable avatars.

## Hackathon Information
Event: Hacklanta 2026
Team: Team Verity
Developers: Abigail Coley & Paiton O'Neal
Project: Verity
Project Type: Mobile-first campus event discovery web application
Main track: Social Good - Cox Automotive
Side Challenges: Auth0

## Build Disclosure
Verity was developed during Hacklanta 2026 using React, Vite, Material UI Icons, Auth0, and other development tools.

Our team created the application's interface and custom campus map during the hackathon. Claude AI assisted with development and map design, while Canva was used for manual visual editing.

Third-party campus references, event information, and flyer imagery were used for demonstration purposes and are not claimed as original team-created assets.

## Disclaimer
Verity is an independent student-developed prototype and is not affiliated with, sponsored by, or endorsed by Georgia State University or the Panther Involvement Network (PIN).
Campus event details and flyer imagery are used for demonstration and should be verified with official organizers before attending. Friend profiles and sample social activity are fictional. Verity does not submit official event RSVPs.
