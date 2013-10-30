/* boundery-markers.js is part of Aloha Editor project http://aloha-editor.org
 *
 * Aloha Editor is a WYSIWYG HTML5 inline editing library and editor.
 * Copyright (c) 2010-2013 Gentics Software GmbH, Vienna, Austria.
 * Contributors http://aloha-editor.org/contribution.php
 */

/**
 * @doc module
 * @name boundary-markers
 * @description
 *
 * ## Boundery Marker Utilities
 *
 * This module houses utilities that are
 * used for for bounder markers.
 *
 */
define([
	'dom',
	'traversing',
	'cursors',
	'arrays',
	'strings',
	'ranges'
], function BoundaryMarkers(
	dom,
	traversing,
	cursors,
	arrays,
	strings,
	ranges
) {
	'use strict';

	if ('undefined' !== typeof mandox) {
		eval(uate)('boundarymarkers');
	}

	/**
	 * @doc function
	 * @name aloha.boundery-markers:insert
	 * @description
	 *
	 * Insert selection markers at the given range.
	 *
	 * @param {Range} range given range
	 */
	function insert(range) {
		var leftMarkerChar  = (3 === range.startContainer.nodeType ? '[' : '{');
		var rightMarkerChar = (3 === range.endContainer.nodeType   ? ']' : '}');
		dom.splitTextContainers(range);
		var leftMarker = document.createTextNode(leftMarkerChar);
		var rightMarker = document.createTextNode(rightMarkerChar);
		var start = cursors.cursorFromBoundaryPoint(
			range.startContainer,
			range.startOffset
		);
		var end = cursors.cursorFromBoundaryPoint(
			range.endContainer,
			range.endOffset
		);
		start.insert(leftMarker);
		end.insert(rightMarker);
	}

	/**
	 * @doc function
	 * @name aloha.boundery-markers:extract
	 * @description
	 *
	 * Set the selection based on selection markers found in the content inside
	 * of `rootElem`.
	 *
	 * @param {DOMObject} rootElem root element
	 * @param {Range} range given range
	 */
	function extract(rootElem, range) {
		var markers = ['[', '{', '}', ']'];
		var markersFound = 0;
		function setBoundaryPoint(marker, node) {
			var setFn;
			if (0 === markersFound) {
				setFn = 'setStart';
				if (marker !== '[' && marker !== '{') {
					throw 'end marker before start marker';
				}
			} else if (1 === markersFound) {
				setFn = 'setEnd';
				if (marker !== ']' && marker !== '}') {
					throw 'start marker before end marker';
				}
			} else {
				throw 'Too many markers';
			}
			markersFound += 1;
			if (marker === '[' || marker === ']') {
				var previousSibling = node.previousSibling;
				if (!previousSibling || 3 !== previousSibling.nodeType) {
					previousSibling = document.createTextNode('');
					node.parentNode.insertBefore(previousSibling, node);
				}
				range[setFn].call(range, previousSibling, previousSibling.length);
				// Because we have set a text offset.
				return false;
			} else { // marker === '{' || marker === '}'
				range[setFn].call(range, node.parentNode, dom.nodeIndex(node));
				// Because we have set a non-text offset.
				return true;
			}
		}
		function extractMarkers(node) {
			if (3 !== node.nodeType) {
				return;
			}
			var text = node.nodeValue;
			var parts = strings.splitIncl(text, /[\[\{\}\]]/g);
			// Because modifying every text node when there can be only two
			// markers seems like too much overhead.
			if (!arrays.contains(markers, parts[0]) && parts.length < 2) {
				return;
			}
			// Because non-text boundary positions must not be joined again.
			var forceNextSplit = false;
			parts.forEach(function (part, i) {
				// Because we don't want to join text nodes we haven't split.
				forceNextSplit = forceNextSplit || (i === 0);
				if (arrays.contains(markers, part)) {
					forceNextSplit = setBoundaryPoint(part, node);
				} else if (!forceNextSplit
						&& node.previousSibling
							&& 3 === node.previousSibling.nodeType) {
					node.previousSibling.insertData(
						node.previousSibling.length,
						part
					);
				} else {
					node.parentNode.insertBefore(
						document.createTextNode(part),
						node
					);
				}
			});
			node.parentNode.removeChild(node);
		}
		traversing.walkRec(rootElem, extractMarkers);
		if (2 !== markersFound) {
			throw 'Missing one or both markers';
		}
	}

	function getPathToPosition(container, offset, limit) {
		var path = [offset];
		if (container === limit) {
			return path;
		}
		traversing.childAndParentsUntilIncl(container, function (node) {
			if (node === limit) {
				return true;
			}
			path.push(dom.nodeIndex(node));
			return false;
		});
		return path;
	}

	function getPositionFromPath(container, path) {
		var node = container;
		while (path.length > 1) {
			node = node.childNodes[path.pop()];
		}
		return {
			container: node,
			offset: path.pop()
		};
	}

	/**
	 * @doc function
	 * @name aloha.boundery-markers:hint
	 * @description
	 *
	 * Returns a string with boundary markers inserted into the representation
	 * of the DOM to indicate the span of the given range.
	 *
	 * @param {Range} range given range
	 * @return {String} boundery markers inserted into the DOM representation
	 */
	function hint(range) {
		var container = range.commonAncestorContainer;

		var startPath = getPathToPosition(
			range.startContainer,
			range.startOffset,
			container
		);

		var endPath = getPathToPosition(
			range.endContainer,
			range.endOffset,
			container
		);

		var node = container.parentNode
			? getPositionFromPath(
				container.parentNode.cloneNode(true),
				getPathToPosition(
					container,
					dom.nodeIndex(container),
					container.parentNode
				)
			).container
			: node = document.createElement('div').appendChild(
				container.cloneNode(true)
			);

		var start = getPositionFromPath(node, startPath);
		var end = getPositionFromPath(node, endPath);

		range = ranges.create(
			start.container,
			start.offset,
			end.container,
			end.offset
		);

		insert(range);

		return dom.outerHtml(
			//range.commonAncestorContainer.parentNode ||
			range.commonAncestorContainer
		);
	}

	/**
	 * Functions for inserting and extracting range boundary markers into the
	 * DOM.
	 *
	 * boundarymarkers.hint()
	 * boundarymarkers.insert()
	 * boundarymarkers.extract()
	 */
	var exports = {
		hint: hint,
		insert: insert,
		extract: extract
	};

	exports['hint'] = exports.hint;
	exports['insert'] = exports.insert;
	exports['extract'] = exports.extract;

	return exports;
});
