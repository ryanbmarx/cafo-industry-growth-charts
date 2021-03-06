# Cafo industry growth

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

About this project
------------------

This is a tarbell project made to run as an embedded HTML blurb item in the story. It uses d3 and a custom class to draw the chart

DATA
====

The data is pulled from a Google Spreadsheet and formatted into a JSON object using JInja, and is passed in to the class instance. 

The text data (i.e. the blurb for each chart, source line) is bound to the corresponding button using data-* attributes.

HOW IT WORKS
============

The chart is blank at load. Nothing will show until a button is clicked. After the chart class is initialized in _content.html, a click on the first button is triggered using javascript.

HACKS?
======

Yes. One. A substitute formatter for D3 is used to make "G" become "B" when turning $1,456,789,765 into $1.5B.

PUBLISHING
==========

This is a blurb, and it uses a seperate python script to publish. The assets (js, css, etc.) must be published to S3 using the standard `tarbell publish production`. The HTMLBlurb portion needs to be published using `python publish_to_p2p_blurb.py`. Copy and paste the command below for your convenience.

`tarbell publish production && python publish_to_p2p_blurb.py`

Assumptions
-----------

* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)

Custom configuration
--------------------

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

Building front-end assets
-------------------------

This blueprint creates configuration to use [Grunt](http://gruntjs.com/) to build front-end assets.

When you create a new Tarbell project using this blueprint with `tarbell newproject`, you will be prompted about whether you want to use [Sass](http://sass-lang.com/) to generate CSS and whether you want to use  [Browserify](http://browserify.org/) to bundle JavaScript from multiple files.  Based on your input, the blueprint will generate a `package.json` and `Gruntfile.js` with the appropriate configuration.

After creating the project, run:

    npm install

to install the build dependencies for our front-end assets.

When you run:

    grunt

Grunt will compile `sass/styles.scss` into `css/styles.css` and bundle/minify `js/src/app.js` into `js/app.min.js`.

If you want to recompile as you develop, run:

    grunt && grunt watch

This blueprint simply sets up the the build tools to generate `styles.css` and `js/app.min.js`, you'll have to explicitly update your templates to point to these generated files.  The reason for this is to make you think about whether you're actually going to use an external CSS or JavaScript file and avoid a request for an empty file if you don't end up putting anything in your custom stylesheet or JavaScript file.

To add `app.min.js` to your template file:

    
    <script src="js/app.min.js"></script>
    