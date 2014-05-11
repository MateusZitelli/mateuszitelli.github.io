var repos = (function($){
	var reposModule = {};
	var repos;

	var createRepoElement = function($ul, repo){
		var $li = $('<li></li>');
		var $a = $('<a class="col-md-4 repo-link" target="_blank"></a>');
		var $div = $('<div class="repo-content"></div>');
		var $title = $('<h3></h3>');
		var $description = $('<p></p>');
		if(repo.fork){
			$title.text(repo.name + " - forked");
		}else{
			$title.text(repo.name);
		}
		$description.text(repo.description)
		$title.appendTo($div);
		$description.appendTo($div);
		$div.addClass(repo.language);
		$div.appendTo($a);
		$a.attr('href', repo.html_url);
		$a.appendTo($li);
		$li.appendTo($ul);
	}

	/*
	 * Add the repository list in an element
	 * param {string || jquery Element} element The element selector where the
	 * list will be put in
	 */
	reposModule.addReposList = function(element, all){
		loadRepos(all).then(function(){
			var $element = $(element);
			if(repos === undefined){
				$element.html("<p>Desculpe mas meus repositórios não puderam ser inicializados.");
				throw Error("Please load the repository list.");
				return;
			}else if(repos === null){
				$element.html("<p>Desculpe mas meus repositórios não puderam ser inicializados.");
				throw Error("No repositories returned.");
				return;
			}

			var $ul = $('<ul class="repo-list list-unstyled"></ul>');
			$.each(repos, function(index, repo){
				createRepoElement($ul, repo);
			});
			$ul.appendTo($element);
		});
	};

	/*
	 * Load the repos list for a given user
	 * param {integer} how_many How many repos to load
	 * param {string} user Github username or org
	 * param {integer} page The page number to be retrieved
	 */

	loadRepos = function(user, page){
		var how_many = 100;
		user = user || "MateusZitelli";
		page = page || 1;
		repos = repos || [];

		var uri = "https://api.github.com/users/"+ user +"/repos?callback=?"
			+ "&sort=created"
			+ "&type=owner"
			+ "&per_page=" + how_many
			+ "&page=" + page;

		return $.getJSON(uri, function(data){
			var loadedRepos = data.data;
			if(data.meta.status !== 200){
				repos = null;
				return
			}
			if(loadedRepos.length !== 0){
				repos = repos.concat(loadedRepos);
				loadRepos(user, page + 1);
			}
		});
	};

	return reposModule;
}($));

exports.repos = repos;
