# GD20: Genetic Algorithms for Crossing Minimization

## Consider K-POP dataset: artists, labels and groups  

![Alt text](/mainOriginal.jpg?raw=true "Optional Title")

## Impact of naive genetic algorithm based on sweep line implementation

![Alt text](/mainGA.jpg?raw=true "Optional Title")

## Novel Algorithm that learns assignment of 12 largest labels to regions while minimizing the number of crossings

![Alt text](/labelEdgeBundling.jpg?raw=true "Optional Title")


## Requirements


- Latest version of Node.js 12 LTS or later (may also work with other versions)
- yFiles for HTML 2.2.0.3

## Setup
- Copy the yFiles library files (the whole `yFiles-for-HTML-Complete-2.2.0.3` folder) into the project folder (the same folder as the package.json)
- Copy the `license.json` into the project folder
- Copy `yfiles-typeinfo.js` from `yFiles-for-HTML-Complete-2.2.0.3/ide-support/` to `app/scripts/` inside your project folder
- Your project directory should now look like the following:
  ```
  Project folder
  ├── .idea
  │   └── ...
  ├── .vscode
  │   └── ...
  ├── app
  │   ├── scripts
  │   │   ├── yfiles-typeinfo.js
  │   │   └── ...
  │   └── ...
  ├── docs
  |   └── ...
  ├── yFiles-for-HTML-Complete-2.2.0.3
  │   ├── ...
  │   └── lib
  │       ├── ...
  │       └── es-modules
  │           └── ...
  ├── .gitignore
  ├── license.json
  ├── package-lock.json
  ├── package.json
  ├── README.md
  ├── tsconfig.json
  └── webpack.config.js
  ```
- Run `npm install`
- After everything is installed you can run the application in the development environment by using the command `npm run start`

## Development
You can find helpful documentation in the docs directory.
