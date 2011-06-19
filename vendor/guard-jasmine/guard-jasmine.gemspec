# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib/', __FILE__)
$:.unshift lib unless $:.include?(lib)

require 'guard/jasmine/version'

Gem::Specification.new do |s|
  s.name        = 'guard-jasmine'
  s.version     = Guard::Jasmine::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ['Elliot Winkler']
  s.email       = ['elliot.winkler@gmail.com']
  s.homepage    = 'https://github.com/mcmire/guard-jasmine-d'
  s.summary     = 'Guard setup for jasmine-node'
  s.description = 'Guard setup for jasmine-node'

  s.required_rubygems_version = '>= 1.3.6'

  s.add_dependency 'guard', '>= 0.4'

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_paths = ["lib"]
end