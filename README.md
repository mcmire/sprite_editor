# sprite editor *(to be renamed)*

Making pixels fun to work with... since about a week ago.

## Running

All the gems that this app requires are cached in `vendor/cache`, so you shouldn't have to install anything.

You'll need to launch a web server to run the app itself. Technically, you don't need to do this, but the app makes Ajax requests to itself and this only works if it's being run through a web server (otherwise you get a same-origin violation). To do this, run:

    bundle exec serve PORT

Now visit http://localhost:PORT.

## Developing

Sass is being used for stylesheets (but of course). [Guard](http://github.com/guard/guard) gives you a way to regenerate CSS files when you update corresponding Sass files. So, simply run:

    bundle exec guard

Now, develop away!

## Roadmap

There's a public Pivotal Tracker project here: <https://www.pivotaltracker.com/projects/289453>

## Resources

The HSL part of the color picker was stolen from http://hslpicker.com (source [here](https://github.com/imathis/hsl-color-picker/)). I really like that a lot.