## usering info from: http://whomwah.com/2006/05/21/deploying-wordpress-using-capistrano/

load 'deploy'

load 'config/deploy' # remove this line to skip loading any of the default tasks

set :deploy_subdir, "web"

# enable submodules
set :git_enable_submodules, 1

set :ssh_options, { :forward_agent => true }

# http://stackoverflow.com/questions/8436480/no-such-file-or-directory-in-capistrano-deploy
set :normalize_asset_timestamps, false

#set :domain, "pinehurst.substancedev.com" # now storing in deploy profiles
#set :application, "pinehurst" # now storing in deploy profiles

default_run_options[:pty] = true	# Must be set for the password prompt
									# from git to work

#set :repository, "<your repo path>" # eg: git@github.com:substancedev/pinehurst.git
#set :repository, "https://github.com/substancedev/pinehurst.git"
#set :branch, "master"
#set :scm, :git
#set :scm_username, "bsr"
set(:scm_password) { Capistrano::CLI.password_prompt("github password (username #{scm_username}): ") } 

#set :deploy_to, "~/domains/pinehurst.substancedev.com"
#set :user, "substancedev.com"

#set :use_sudo, false

set(:domain) { "#{domain}" }
role(:app) {domain}
role(:web) {domain}
role(:db)  {domain}

desc "This is here to overide the original :restart"
task :restart, :roles => :app do
  # do nothing but overide the default
end

namespace :deploy do

	desc 'link webroot up right'
	task :create_symlink do
		# http://wiki.apisnetworks.com/index.php/Capistrano
	    latest_release_relative = relative_path( deploy_to, latest_release ) 
		run "cd #{deploy_to} ; ln -nfs #{latest_release_relative} #{deploy_to}/#{serverdeploy_subdir}"
		puts "#{deploy_to}";

		#run "cd #{deploy_to}/html/content ; touch foobob"

	end

	task :create_symlink, :except => { :no_release => true } do
		deploy_to_pathname = Pathname.new(deploy_to)

		on_rollback do
			if previous_release
				previous_release_pathname = Pathname.new(previous_release)
				relative_previous_release = previous_release_pathname.relative_path_from(deploy_to_pathname)
				run "rm -f #{deploy_to}/#{serverdeploy_subdir}; ln -nfs #{relative_previous_release} #{deploy_to}/#{serverdeploy_subdir}; true"
			else
				logger.important "no previous release to rollback to, rollback of symlink skipped"
			end
		end

		latest_release_pathname = Pathname.new(latest_release)
		relative_latest_release = latest_release_pathname.relative_path_from(deploy_to_pathname)
		run "rm -f #{deploy_to}/#{serverdeploy_subdir} && ln -nfs #{relative_latest_release} #{deploy_to}/#{serverdeploy_subdir}"

		# link up uploads directory (not needed now)
		#run "cd #{deploy_to}/html/content && ln -nfs ../../../shared/content/uploads"


	end



	desc "finalze update"
	task :finalize_update do
		# nothing
	end

	desc 'add shared linking'
	task :link_shared do
	    latest_release_relative = relative_path( deploy_to, latest_release ) 
		run "cd #{deploy_to}/releases ; ln -nfs ../shared ./shared"
	end

	desc 'init server side directories'
	task :initDirectories do
		run "cd #{deploy_to}; mkdir -p shared/content/uploads; mkdir -p releases"
	end

end
before "deploy", "deploy:initDirectories"
after "deploy", "deploy:cleanup"
after "deploy:cleanup", "deploy:link_shared"





