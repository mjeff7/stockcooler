# Stock Cooler (fcc-dynamicwebapps-stock)

Plot historical quotes of stock symbols interactively and collaboratively. Visitors who come to this app will see the same symbols and share comments with each other. Try it live [here](http://fcc-project-platform.herokuapp.com/stock/).

This project is part of FreeCodeCamp curriculum and completes the [*Chart the Stock Market* project](https://www.freecodecamp.com/challenges/chart-the-stock-market).

## Project layout

This repo contains the server-side and client-side histories as separate branches which are joined (on branch *joined*) as something of a build step before deploying. The entire repo is the server-side code base with the client-side code in the top-level directory *client*.

This project has also been tweaked to deploy as a sub-application alongside other FreeCodeCamp projects. The live demo above deploys this app under the path ```/stock/```, but this app will see that as its root directory.
