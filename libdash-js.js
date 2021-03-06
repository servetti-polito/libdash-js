
// Create a single global variable to hold all dashjs-related modules
var libdashjs;
if(!libdashjs) libdashjs = {};

libdashjs = ( function namespace() {


	// Define the various libdashjs classes here, using local variables and functions

	function DASHManager() {
		console.debug("[DASHManager]");
	}

	// Returns an MPD object
	DASHManager.prototype.open = function (mpdtext) {
		console.debug("[DASHManager.prototype.open]");

		var mpd = new IMPD(xml.xmlToJSON(mpdtext));

		return mpd
	}

	
	function StateManager() {
		this.state = StateManager.states.NOT_STARTED;
	}

//	StateManager.states = [ 'NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'ETC' ];
	StateManager.states = { NOT_STARTED: 'NOT_STARTED', 
				STARTED: 'STARTED', 
				IN_PROGRESS: 'IN_PROGRESS',
				COMPLETED: 'COMPLETED'  };

	Segment.firstSegment = true;

	function Segment(baseurls, uri, no) {
		this.absoluteuri = baseurls[0] + uri;
		this.stateManager = new StateManager();
		this.data = null;
		this.no = no;
	}

		

	Segment.prototype.startDownload = function (buffer) {
		var xhr = new XMLHttpRequest();
		var that = this;
		xhr.open('GET', this.absoluteuri, true);
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		xhr.responseType = 'arraybuffer'; 
		
		// FIXME [IMPORTANT]: manage download failure, abort, etc.
		//                    signal to the "chunk" abstraction
		xhr.onload = function(e) {
			if (xhr.status != 200) { 
				console.warn("Unexpected status code " + xhr.status + " for " + that.absoluteuri);
				return false;
			}
			console.log("Received: " + that.absoluteuri);
			that.state = StateManager.states.COMPLETED;

			that.data = new Uint8Array(xhr.response);
			that.addToBuffer(buffer);
			// FIXME [IMPORTANT]: blockStream.PushBack 
		}
		xhr.send();

		// FIXME [IMPORTANT]: set chunk download state as "in progress"
		this.state = StateManager.states.STARTED;
	}

	Segment.prototype.addToBuffer = function(buffer) {
		// FIXME: find the right offset
		if(Segment.firstSegment == true && this.no != 0) {
			Segment.firstSegment = false;
			buffer.timestampOffset = -(this.no-1) * 2;	// FIXME: use segment duration
		}
		buffer.append(this.data);
	}

	function IMPD(mpd) {

		this._url = null;
		this._mpd = mpd.MPD;
		console.debug(this._mpd);

//		this._baseurls = ['http://attinia.polito.it:8080/_dash-js/','B','C','D'];
//
//		// see node.js xml2js
//                this._representation = {
//                        segmentbase: {  
//                                initialization: {
//                                        $: { sourceurl: 'bunny_2s_200kbit/bunny_200kbit_dash.mp4' }
//                                }
//                        },
//			segmentlist: {
//				$: { duration: 2 },
//				segmenturl: [
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s1.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s2.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s3.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s4.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s5.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s6.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s7.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s8.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s9.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s10.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s11.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s12.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s13.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s14.m4s' } },
//				{ $: { media: 'bunny_2s_200kbit/bunny_2s15.m4s' } },
//				]
//			}
//                } 
//
//		// convert to segments
	}
	
	IMPD.prototype = {
		get url() {  
			console.debug("[IMPD.prototype.getUrl]"); 
			return this._url; 
		},
		set url(url) { 
			console.debug("[IMPD.prototype.setUrl]"); 
			this._url = url; 
		},
		get baseurls() {
			console.debug("[IMPD.prototype.getBaseUrls]"); 
//			return this._baseurls;
			return this._mpd.BaseURL.Text;
		},
		get representation() {
			console.debug('[IMPD.prototype.representation]');
			return this._mpd.Period.AdaptationSet.Representation;
		},
		get availabilityStartTime() {
			var utc_str = this._mpd["@availabilityStartTime"];
			return new Date(utc_str);
		},
		get segmentDuration() {
			// FIXME requires representation no ?
			return this._mpd.Period.AdaptationSet.Representation.SegmentTemplate["@duration"];
		},
		constructor: IMPD
	}

	// Now export libdashjs API by returning a namespace object
	return {
		DASHManager: DASHManager,
		Segment: Segment,
		IMPD: IMPD
	};


}()); // Immediate function invocation

