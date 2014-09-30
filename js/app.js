require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
	"d3": "../d3/d3"
    },

    
    "shim": {
    }
});

require(['d3list'], function(d3list) {
  d3list.init();
});
