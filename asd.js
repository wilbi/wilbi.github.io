
$(document).ready(function(){
	$("#send").on("click", function(){

		$("#send").attr("disabled", "disabled");
		// Read user input

		let data = readData();
		if(data.err) {
			displayError(data.err);
			return;
		}
		// Data is good, set initial variables
		let names = data.names;
		let sr = data.sr;
		const teamsize = data.teamsize;

		// Merge the lists
		merged = merge(names,sr);
		if(merged.err){
			displayError(merged.err);
			return;
		}
		arr = merged.final;
		const pool = arr.length;
		const poolSize = Math.floor(pool/teamsize);
		let exclude = [], i, r = 100000, choice, average, teams = [], teamNum = [], diff;

		// Set the number of random iterations based on player count
		if(pool > 250){
			r = 1000;
		} else if (pool > 75) {
			r =	50000;
		}
		// Duplicate the array
		let arr1 = JSON.parse(JSON.stringify(arr));
		// Use simple and fast algorithm to find initial best case
		let results = initial(arr1, teamsize, poolSize);
		let bestTeam = results.teams;
		let bestExclude = results.arr;
		let best = results.diff;
		// Create a list of numbers in the range of the number of teams
		for(let i = 0; i<poolSize; i++){
			teamNum.push(i);
		}
		// Start random iterations
		let dup;
		while(best >= 50 && r--){
			// Create an array of arrays for teams
			for(let h = 0; h < poolSize; h++){
				teams.push([]);
			}
			exclude = [];
			// Remove random players until player count is divisible by team size
			while((arr.length - exclude.length)%teamsize != 0){
				exclude.push(Math.floor(Math.random()*arr.length));
				exclude = [... new Set(exclude)];
			}
			average=[];
			dup = teamNum.slice();
			i = arr.length;
			// Divide players in to random teams
			while(i--){
				if(exclude.filter(index => index === i).length != 0) continue;
				choice = Math.floor(Math.random()*dup.length);
				teams[dup[choice]].push(arr[i]);
				if(teams[dup[choice]].length === teamsize) dup.splice(choice,1);
			}
			// Calculate the average skill rating of the teams
			average = teams.map(team => {
				let tAvg = team.reduce(function(sum, player){return sum+player.rank;},0)/teamsize;
				team.avgSr = tAvg;
				return tAvg;
			});
			diff = average.reduce((a,b) => Math.max(a,b)) - average.reduce((a,b) => Math.min(a,b));
			// Check if the resulting team is better than the current best team
			if (diff < best) {
				bestTeam = teams.slice();
				best = diff;
				bestExclude = exclude;
				console.log("better")
			}
			teams = [];
		}

		// Create output
		let teamOutput = "Largest Difference: " + Math.floor(best);
		teamOutput += "\nAverage Sr: " + Math.floor(bestTeam.reduce((total, team) => team.avgSr+total, 0)/bestTeam.length);
		teamOutput += (bestExclude.length === 0) ? "" : "\nExcluded: " + bestExclude.map(index =>{
			let ret = (index.hasOwnProperty("name")) ? index.name : arr[index].name;
			return ret;
		}).join(", ") + "\n";
		teamOutput += "\nTeams:";
		teamOutput += bestTeam.map((team, i) => {
			return "\nTeam "+ (i+1) + ", Average Sr: " +Math.floor(team.avgSr) +
			team.map(member => "\n\t" + member.name + ", " + member.rank + " sr").join("")
		}).join("");
		$("#teamDisplay").html(teamOutput);
		$("#send").removeAttr("disabled");
	});

	function initial(arr, teamsize, poolSize){
		let teamSR = 0, choice;
		let teams = [];
		// Sort the players
		arr.sort((a,b) => {
			if(a.rank < b.rank) return -1;
			if(a.rank > b.rank) return 1;
			return 0;
		})
		// Create an array of arrays
		let pools = [];
		for(let i = 0; i<teamsize; i++){
			pools.push(arr.splice(0,Math.min(arr.length, poolSize)));
		}
		// Divide in to teams
		for(let i = 0; i<poolSize; i++){
			teams.push([]);
			let midway = Math.floor((teamsize-1)/2);
			for(let j = 0; j < midway; j++){
				teams[i].push(pools[j].splice(0,1)[0]);
			}
			if(teamsize%2 != 0){
				teams[i].push(pools[midway].splice(Math.floor(pools[midway].length/2),1)[0]);
				midway++;
			}
			for(let j = midway; j < teamsize; j++){
				teams[i].push(pools[j].pop())
			}
			teams[i].avgSr = Math.floor(teams[i].reduce((totalRanking, member) =>
			member.rank+totalRanking,0)/teamsize);
			teamSR += teams[i].avgSr;
		}

		//Calculate interesting stats

		teamSR = Math.floor(teamSR/poolSize);
		teams.sort((a,b) => {
			if(a.avgSr < b.avgSr)return -1;
			if(a.avgSr > b.avgSr)return 1;
			return 0;
		});
		let diff = teams[poolSize-1].avgSr-teams[0].avgSr;
		return {teams, arr, diff};
	}

	function readData(){
		let teamsize = parseInt($("#size").val());
		let err = 0;
		if (isNaN(teamsize) || teamsize <= 0) err = 2;
		let names = $("#names").val();
		let sr = $("#sr").val();
		names = parseInput(names);
		sr = parseInput(sr);
		let len = sr.length;
		sr = sr.map(a => parseInt(a));
		sr = sr.filter(Number);
		if(sr.length != len && sr.length != names.length) err = 3;
		if(names.length === 0 || sr.length === 0) err = 1;
		return {names, sr, teamsize, err};

	}

	function merge(arr1, arr2){
		let len = Math.min(arr1.length, arr2.length);
		let err = 0;
		let final = [];
		if(arr1.length != arr2.length) err = 1;
		else{
			for(let i = 0; i < len; i++){
				let name = arr1.pop();
				let rank = arr2.pop();
				final.push({"name":name, "rank":rank});
			}
		}
		return {final, err};
	}

	function parseInput(input){
		return input.replace(/(\s)+/gim, ";").split(";").filter(String);
	}

	function displayError(code){
		let notif = $("#notif");
		let messages = ["The lists are not the same length", "Teamsize not set", "Ranking list could not be parsed correctly"];
		notif.html(messages[code-1]);
		notif.attr("style", "display:inline");
		$("#send").removeAttr("disabled");
		setTimeout(() => $("#notif").fadeOut("slow"), 3000);
	}
});
