/* TODO:  Add messages to user
					Merge both algorithms under the same button
					Merge outputs in to a single function
*/

$(document).ready(function(){

	$("#send").on("click", function(){

		$("#send").attr("disabled", "disabled")
		/*
		Fix team sizes not being respected
		*/

		let data = readData();
		let names = data.names;
		let sr = data.sr;
		const teamsize = data.teamsize;

		/* Add messages to user */

		const pool = sr.length;
		const poolSize = Math.floor(pool/teamsize);
		let best = 999999, bestTeam, exclude = [], i, r = 100000, choice, average, teams = [], teamNum = [], diff;
		/* Merge the lists */
		if(pool > 250){
			r = 10;
		} else if (pool > 75) {
			r =
			50000;
		}
		merged = merge(names,sr);
		if(merged.err){
			displayError(merged.err);
			return;
		}
		arr = merged.final;
		let arr1 = JSON.parse(JSON.stringify(arr));
		let results = initial(arr1, teamsize, poolSize);
		bestTeam = results.teams;
		bestExclude = results.arr;
		best = results.diff;
		let source = 0;
		for(let i = 0; i<poolSize; i++){
			teamNum.push(i);
		}
		let dup;
		while(best >= 50 && r--){

			for(let h = 0; h < poolSize; h++){
				teams.push([]);
			}
			exclude = [];
			while((arr.length - exclude.length)%teamsize != 0){
				exclude.push(Math.floor(Math.random()*arr.length))
				exclude = [... new Set(exclude)];
			}
			average=[];
			dup = teamNum.slice();
			i = arr.length;
			while(i--){
			if(exclude.filter(index => index === i).length != 0) continue;
				choice = Math.floor(Math.random()*dup.length);
				teams[dup[choice]].push(arr[i]);
				if(teams[dup[choice]].length === teamsize) dup.splice(choice,1);
			}
			average = teams.map(team => {
				let tAvg = team.reduce(function(sum, player){return sum+player.rank;},0)/teamsize
				team.avgSr = tAvg;
				return tAvg;
			});
			diff = average.reduce((a,b) => Math.max(a,b)) - average.reduce((a,b) => Math.min(a,b));
			if (diff < best) {
				bestTeam = teams.slice();
				best = diff;
				bestExclude = exclude;
				source = 1;
				console.log("source change")
			}
			teams = [];
		}
		if(source === 0) arr = bestExclude;
		/* Formulate the eventual output */
		let teamOutput = "Largest Difference: " + Math.floor(best)
		teamOutput += "\nAverage Sr: " + Math.floor(bestTeam.reduce((total, team) => team.avgSr+total, 0)/bestTeam.length)
		teamOutput += (bestExclude.length === 0) ? "" : "\nExcluded: " + bestExclude.map(index =>{
			let ret = (index.hasOwnProperty("name")) ? index.name : arr[index].name
			return ret;
		}).join(", ") + "\n"
		teamOutput += "\nTeams:";
		teamOutput += bestTeam.map((team, i) => {
			return "\nTeam "+ (i+1) + ", Average Sr: " +Math.floor(team.avgSr) +
			team.map(member => "\n\t" + member.name + ", " + member.rank + "sr")
		})
		/*
		for(i = 0; i < bestTeam.length; i++){
			teamOutput += "Team " + (i+1)+ ","+ bestTeam[i].length + " Average Sr: " + Math.floor(bestTeam[i].avgSr);
			for(let j = 0; j < bestTeam[i].length; j++){
				teamOutput += "\n" + bestTeam[i][j].name + ", " + bestTeam[i][j].rank + " sr";
			}
			teamOutput += "\n"
		}*/
		$("#teamDisplay").html(teamOutput);
		$("#send").removeAttr("disabled")
	});

/* Generate test data */
/*
$("#testData").on("click", () => {
	let names = [];
	let srs = [];
	for(let i = 0; i < 1000; i++){
		names.push(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,7));
		srs.push((Math.floor(norm()*2500)+2500));
	}
	$("#names").html(names.map((name) => { return name + '\n'}));
	$("#sr").html(srs.map((sr) => {return sr + '\n'}));
})

/* Parse Inputs */

/* Use simple and fast algorithm to find initial best case */

	function initial(arr, teamsize, poolSize){
		let teamSR = 0, choice;
		let teams = [];
		arr.sort((a,b) => {
			if(a.rank < b.rank) return -1;
			if(a.rank > b.rank) return 1;
			return 0;
		})
		let pools = [];
		for(let i = 0; i<teamsize; i++){
			pools.push(arr.splice(0,Math.min(arr.length, poolSize)))
		}
		/* Divide in to teams */

		for(let i = 0; i<poolSize; i++){
			teams.push([]);
			for(let j = 1; j < teamsize-1; j++){
				teams[i].push(pools[j].splice(Math.floor(pools[j].length/2),+1)[0])
			}
			teams[i].push(pools[0].splice(0,1)[0]);
			teams[i].push(pools[teamsize-1].pop());
			teams[i].avgSr = Math.floor(
			teams[i].reduce((totalRanking, member) =>
											{return member.rank+totalRanking},0)/teamsize);
			teamSR += teams[i].avgSr;
		}

		/*Calculate interesting stats */

		teamSR = Math.floor(teamSR/poolSize);
		teams.sort((a,b) => {
			if(a.avgSr < b.avgSr)return -1;
			if(a.avgSr > b.avgSr)return 1;
			return 0;
		});
		let diff = teams[poolSize-1].avgSr-teams[0].avgSr
		return {teams, arr, diff}
	}

	function readData(){
		let teamsize = parseInt($("#size").val());
		if (isNaN(teamsize) || teamsize <= 0) return -1;
		let names = $("#names").val();
		let sr = $("#sr").val();
		names = parseInput(names);
		sr = parseInput(sr);
		sr = sr.map(a => parseInt(a));
		if(isNaN(sr[sr.length-1])) sr.pop();
		if(names.length != sr.length) names.pop();
		if(names.length === 0 || sr.length === 0) return -1;

		return {names, sr, teamsize}

	}

	function merge(arr1, arr2){
		let len = Math.min(arr1.length, arr2.length);
		let err = 0;
		let final = [];
		if(arr1.length != arr2.length) err = 1;
		for(let i = 0; i < len; i++){
			let name = arr1.pop();
			let rank = arr2.pop();
			final.push({"name":name, "rank":rank});
		}
		return {final, err};
	}

	function parseInput(input){
		parser = input.replace(/(\s)+/gim, ";")
		return parser.split(";");
	}
/* Generate pseudo-normally distributed numbers */
/*
	let norm = () => {
		return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
	}
	function displayError(code){
		let notif = $("#notif")
		notif.html("The lists are not the same length")
		notif.toggleClass("hidden");
		$("#send").removeAttr("disabled");
		setTimeout(() => $("#notif").toggleClass("hidden"), 3000)
	}
*/
});
