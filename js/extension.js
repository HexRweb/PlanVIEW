/*
* PlanView Chrome Extension Library
*/

window.pv = window.pv ||
{
	getOption: function(option)
	{
		return localStorage.getItem(option);
	},
	updateOption: function(option,value,callback)
	{
		var current = localStorage.getItem(option);
		if(pv.containsDifference(current,value))
		{
			localStorage.setItem(option,value);
			chrome.storage.sync.set({option: value});
			pv.pushChange("UPDATE","pv.updateOption",current,value,{"format":"STRING","syncUpdated":true});
			return true;
		}
		else return false;
	},
	setOption: function(option,value)
	{
		return pv.updateOption(option,value);
	},
	pushChange: function(type,initiator,previous,current,otherInfo)
	{
		/*TODO:Add code to this. I have no idea how I'm going to implement it but it's supposed to basically serve as an undo*/
		console.log("Change received:",type,initiator,previous,current,otherInfo);
		return;
	},
	containsDifference: function(before, after)
	{
		return !(after === before)
	},
	init: function(otherInit)
	{
		/*Init functions*/
		pv.links.updateLinks();
		$(".button-collapse").sideNav();
		$(".class").click(pv.links.events.click);
		$(".carousel").carousel();
		if(typeof otherInit === "string" && typeof pv["init_"+otherInit] === "function")
			pv["init_"+otherInit]();
	},
	init_settings: function()
	{
		$("#save-links").click(pv.links.events.saveAll);
		$("#save-emails").click(pv.emails.events.saveAll);
		$("#autosave").change(function(){pv.updateOption("autosave",$(this).is(":checked")); Materialize.toast("Autosave settings updated!",1000);});
		for(var i = 1; i <=8; i++)
		{
			$("#block-"+i+"-link").val(pv.links.getBlock(i).replace(/#noLink/g,""));
			$("#block-"+i+"-email").val(pv.emails.getBlock(i).replace(/#noEmail/g,""));
		}
	},
	init_notes: function()
	{
		if(localStorage.getItem("notes") == null)
			pv.notes.create();
		pv.notes.fillAll();

		if(localStorage.getItem("emails") == null)
			pv.emails.create();
		pv.emails.updateEmails();
		$(".email").click(pv.emails.events.click);
	},
	init_getStarted: function()
	{

	},
	emails:
	{

		getBlock: function(block)
		{
			return JSON.parse(pv.getOption("emails"))[block];
		},
		updateBlock: function(block,email)
		{
			var current = JSON.parse(pv.getOption("emails")), previous = current[block];
			if(pv.containsDifference(previous,email))
			{
				current[block] = email;
				pv.updateOption("emails",JSON.stringify(current));
				pv.pushChange("UPDATE","email.updateBlock",previous,email,{"block":block,"format":"STRING"});
				return true;
			}
			return false;
		},
		setBlock: function(block,email)
		{
			return pv.emails.updateBlock(block,email);
		},
		resetEmails: function()
		{
			var del = JSON.parse(pv.getOption("emails"));
			for(toDel in del)
			{
				pv.emails.updateBlock(toDel,"");
			}
			pv.pushChange("RESET","email.resetEmails",del,JSON.parse(pv.getOption("emails")),{"format":"JSON"});
		},
		workabale: function(check)
		{
			return ((typeof check !== "undefined") && (check !== "") && (check !== null));
		},
		create: function()
		{
			var old = pv.getOption("emails");
			pv.updateOption("emails","{}");
			for(var i = 1; i <= 8; i++)
			{
				pv.emails.setBlock(i,""); //Even though set is deprecated it's more definitive of what we're doing
			}
			pv.pushChange("REBUILD","email.create",JSON.parse(old),JSON.parse(pv.getOption("emails")),{"format":"JSON"})
		},
		openEmail:function(email)
		{
			chrome.tabs.create({url:"mailto:"+email});
		},
		updateEmails: function(prefix,suffix)
		{
			prefix = prefix || "#block-";
			suffix = suffix || "-email";
			for(var i = 1 ; i <=8; i++)
			{
				var email = pv.emails.getBlock(i);
				$(prefix+i+suffix).attr("data-email",email);
				email = (email.indexOf("#") >= 0) ? "No email set!" : email;
				$(prefix+i+suffix).attr("title",email);
			}
		},
		events:
		{
			click:function(event)
			{
				var email = $(this).attr("data-email");
				email.replace(/mailto:/g,""); //Ensures that adding mailto won't make it mailto:mailto:example@hexr.org
				if(email.indexOf("#") == 0 || email == "")
				{
					event.preventDefault();
					$("#noEmail").openModal();
				}
				else pv.emails.openEmail(email);
			},
			saveAll: function(event)
			{
				event.preventDefault()
				for(var i = 1; i<=8; i++)
				{
					var email = $("#block-"+i+"-email").val();
					if(email == "" || email == null)
						email = "#noEmail";
					pv.emails.updateBlock(i,email);
				}
				Materialize.toast("Emails updated!",5000)
			}
		}
	},
	links:
	{
		getBlock: function(block)
		{
			return JSON.parse(pv.getOption("links"))[block];
		},
		updateBlock: function(block,link)
		{
			var current = JSON.parse(pv.getOption("links")), previous = current[block];
			if(pv.containsDifference(previous,link))
			{
				current[block] = link;
				if(link == "") link = "#noLink";
				pv.updateOption("links",JSON.stringify(current));
				pv.pushChange("UPDATE","links.updateBlock",previous,link,{"block":block,"format":"STRING"});
				return true;
			}
			return false;
		},
		setBlock: function(block,link)
		{
			return pv.links.updateBlock(block,link);
		},
		resetLinks: function()
		{
			var del = JSON.parse(pv.getOption("links"));
			for(toDel in del)
			{
				pv.links.updateBlock(toDel,"");
			}
			pv.pushChange("RESET","links.resetLinks",del,JSON.parse(pv.getOption("links")),{"format":"JSON"});
		},
		workabale: function(check)
		{
			return ((typeof check !== "undefined") && (check !== "") && (check !== null));
		},
		create: function()
		{
			var old = pv.getOption("links");
			pv.updateOption("links","{}");
			for(var i = 1; i <= 8; i++)
			{
				pv.links.setBlock(i,""); //Even though set is deprecated it's more definitive of what we're doing
			}
			pv.pushChange("REBUILD","links.create",JSON.parse(old),JSON.parse(pv.getOption("links")),{"format":"JSON"})
		},
		updateLinks: function(prefix,suffix)
		{
			prefix = prefix || "#block-";
			suffix = suffix || "";
			for(var i = 1 ; i <=8; i++)
			{
				$(prefix+i+suffix).attr("data-location",pv.links.getBlock(i));
			}
		},
		events:
		{
			saveAll: function(event)
			{
				event.preventDefault()
				for(var i = 1; i<=8; i++)
				{
					var link = $("#block-"+i+"-link").val();
					if(link == "" || link == null)
						link = "#noLink";
					pv.links.updateBlock(i,link);
				}
				Materialize.toast("Links saved!",5000)
			},
			click: function(event)
			{
				link = $(this).attr("data-location");
				console.log(link);
				if(link.indexOf("#") == 0 || link == "")
					$("#noLink").openModal();
				else pv.links.open(link)
			}
		},
		open: function(what)
		{
			chrome.tabs.create({url:what});
		},
	},
	notes:
	{
		getBlock: function(block)
		{
			return JSON.parse(pv.getOption("notes"))[block];
		},
		updateBlock: function(block,note)
		{
			var current = JSON.parse(pv.getOption("notes")), previous = current[block];
			if(pv.containsDifference(previous,note))
			{
				current[block] = note;
				pv.updateOption("notes",JSON.stringify(current));
				pv.pushChange("UPDATE","notes.updateBlock",previous,note,{"block":block,"format":"STRING"});
				return true;
			}
			return false;
		},
		setBlock: function(block,note)
		{
			return pv.notes.updateBlock(block,note);
		},
		resetNotes: function()
		{
			var del = JSON.parse(pv.getOption("notes"));
			for(toDel in del)
			{
				pv.notes.updateBlock(toDel,"");
			}
			pv.pushChange("RESET","notes.resetNotes",del,JSON.parse(pv.getOption("notes")),{"format":"JSON"});
		},
		workabale: function(check)
		{
			return ((typeof check !== "undefined") && (check !== "") && (check !== null));
		},
		create: function()
		{
			var old = pv.getOption("notes");
			pv.updateOption("notes","{}");
			for(var i = 1; i <= 8; i++)
			{
				pv.notes.setBlock(i,""); //Even though set is deprecated it's more definitive of what we're doing
			}
			pv.pushChange("REBUILD","notes.create",JSON.parse(old),JSON.parse(pv.getOption("notes")),{"format":"JSON"})
		},
		fillAll: function(prefix,suffix)
		{
			prefix = prefix || "#block-";
			suffix = suffix || "-notes";
			for(var i = 1; i <= 8; i++)
			{
				$(prefix+i+suffix).val(pv.notes.getBlock(i));
			}
		},
		events:
		{
			save: function(){},
		}
	},
	firstRun: function()
	{
		pv.links.create();
		pv.emails.create();
		pv.notes.create();
		pv.updateOption("autosave",false);
		localStorage.setOption("initialized",true);
		pv.updateOption("initialized",true);
	}
};
if(!(pv.getOption("initialized") === true)) pv.firstRun();