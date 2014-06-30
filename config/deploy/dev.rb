# http://stackoverflow.com/questions/8436480/no-such-file-or-directory-in-capistrano-deploy

set :normalize_asset_timestamps, false

set :domain, "<site host>" 		# eg: pinehurst.substancedev.com
set :application, "<site name>" # eg: pinehurst

set :repository, "<your repo path>" # eg: git@github.com:substancedev/pinehurst.git
set :branch, "master"
set :scm, :git

set :deploy_to, "<path to deploy to>" # eg: ~/domains/pinehurst.substancedev.com
set :user, "substancedev" # the remote user
set :serverdeploy_subdir, "web"

set :use_sudo, false
