
	define(['aloha/jquery', 'aloha/repository'],
    function (jQuery, repository) {

        new(repository.extend({

            _constructor: function () {
                this._super('custom-repository');
            },

            urlset: [{
                name: 'Aloha Editor',
                url: 'http://aloha-editor.org',
                type: 'website'
            }, {
                name: 'Aloha Editor on Github',
                url: 'https://github.com/alohaeditor/Aloha-Editor',
                type: 'website'
            }],

            /**
             * initalize LinkList, parse all links, build folder structure and add
             * additional properties to the items
             */
            init: function () {
                var that = this;

                // Add ECMA262-5 Array method filter if not supported natively.
                // But we will be very conservative and add to this single array
                // object so that we do not tamper with the native Array prototype
                // object
                if (!('filter' in Array.prototype)) {
                    this.urlset.filter = function (filter, that /*opt*/ ) {
                        var other = [],
                            v,
                            i = 0,
                            n = this.length;

                        for (; i < n; i++) {
                            if (i in this && filter.call(that, v = this[i], i, this)) {
                                other.push(v);
                            }
                        }

                        return other;
                    };
                }

                jQuery.ajax({
                    type: "GET",
                    dataType: "json",
                    async: false,
                    url: '/lib/aloha/src/demo/simple2/repository_query.json',
                    success: function (data) {
                        //console.log('lookup data', data);
                        var items = [];
                        if (data && data.length) {

                            that.urlset = data;
                        }
                    },
                    error: function (data) {
                        //console.log('lookup error', data);
                    }
                });
                this.repositoryName = 'Bluetrain Images';
            },


            /**
             * Searches a repository for object items matching query if
             * objectTypeFilter. If none is found it returns null.
             *
             * @param {Object} p
             * @param {Function} callback
             * @return {null|Array}
             */
            query: function (p, callback) {
                // Not supported; filter, orderBy, maxItems, skipcount, renditionFilter
                //var r = new RegExp(p.queryString, 'i');

                //console.log('query', this.urlset);
                /*
                var d = this.urlset.filter(function (e, i, a) {
                    return (
                        (!p.queryString || e.name.match(r) || e.url.match(r)) &&
                        (!p.objectTypeFilter || (!p.objectTypeFilter.length) || jQuery.inArray(e.type, p.objectTypeFilter) > -1) &&
                        true
                    );
                });*/

                callback.call(this, this.urlset);
            },

        }))();

    });