
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (312:4) {#if error}
    function create_if_block_2(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Error: ");
    			t1 = text(/*error*/ ctx[3]);
    			set_style(p, "color", "red");
    			add_location(p, file, 312, 5, 8538);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 8) set_data_dev(t1, /*error*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(312:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (458:6) {#if imgUrls.length > 0}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*imgUrls*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*copyImageUrl, imgUrls*/ 2) {
    				each_value_1 = /*imgUrls*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(458:6) {#if imgUrls.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (459:7) {#each imgUrls as imgUrl}
    function create_each_block_1(ctx) {
    	let div8;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let div7;
    	let div3;
    	let div2;
    	let t4;
    	let div5;
    	let div4;
    	let t6;
    	let div6;
    	let button;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Image_name";
    			t2 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "980 KB";
    			t4 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "ICO";
    			t6 = space();
    			div6 = element("div");
    			button = element("button");
    			button.textContent = "Copy Image URL";
    			t8 = space();
    			attr_dev(img, "class", "rectangle svelte-oqoyk");
    			if (!src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image1");
    			attr_dev(img, "id", "imageToCopy");
    			add_location(img, file, 468, 10, 13159);
    			attr_dev(div0, "class", "text-wrapper-14 svelte-oqoyk");
    			add_location(div0, file, 474, 10, 13298);
    			attr_dev(div1, "class", "frame-2 svelte-oqoyk");
    			add_location(div1, file, 467, 9, 13126);
    			attr_dev(div2, "class", "text-wrapper-15 svelte-oqoyk");
    			add_location(div2, file, 480, 11, 13465);
    			attr_dev(div3, "class", "file-size svelte-oqoyk");
    			add_location(div3, file, 479, 10, 13429);
    			attr_dev(div4, "class", "text-wrapper-4 svelte-oqoyk");
    			add_location(div4, file, 485, 11, 13600);
    			attr_dev(div5, "class", "image-type svelte-oqoyk");
    			add_location(div5, file, 484, 10, 13563);
    			add_location(button, file, 490, 11, 13728);
    			attr_dev(div6, "class", "frame-4 svelte-oqoyk");
    			add_location(div6, file, 489, 10, 13694);
    			attr_dev(div7, "class", "frame-3 svelte-oqoyk");
    			add_location(div7, file, 478, 9, 13396);
    			attr_dev(div8, "class", "image-frame-vertical svelte-oqoyk");
    			attr_dev(div8, "data-selected", "false");
    			add_location(div8, file, 463, 8, 13029);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div3);
    			append_dev(div3, div2);
    			append_dev(div7, t4);
    			append_dev(div7, div5);
    			append_dev(div5, div4);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, button);
    			append_dev(div8, t8);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", copyImageUrl, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imgUrls*/ 2 && !src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[7])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(459:7) {#each imgUrls as imgUrl}",
    		ctx
    	});

    	return block;
    }

    // (511:9) {#if imgUrls.length > 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*imgUrls*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*downloadImage, imgUrls, copyImageUrl*/ 2) {
    				each_value = /*imgUrls*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(511:9) {#if imgUrls.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (512:10) {#each imgUrls as imgUrl}
    function create_each_block(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let t2;
    	let div5;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t3;
    	let div4;
    	let t5;
    	let div12;
    	let div10;
    	let div7;
    	let div6;
    	let t7;
    	let div9;
    	let div8;
    	let t9;
    	let div11;
    	let button0;
    	let t11;
    	let button1;
    	let t13;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*imgUrl*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "1600 x 1200";
    			t2 = space();
    			div5 = element("div");
    			img = element("img");
    			t3 = space();
    			div4 = element("div");
    			div4.textContent = "Image_name";
    			t5 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "ICO";
    			t7 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "980 KB";
    			t9 = space();
    			div11 = element("div");
    			button0 = element("button");
    			button0.textContent = "Copy Image URL";
    			t11 = space();
    			button1 = element("button");
    			button1.textContent = "Download";
    			t13 = space();
    			attr_dev(div0, "class", "select svelte-oqoyk");
    			add_location(div0, file, 516, 12, 14425);
    			attr_dev(div1, "class", "text-wrapper svelte-oqoyk");
    			add_location(div1, file, 518, 13, 14499);
    			attr_dev(div2, "class", "image-dim svelte-oqoyk");
    			add_location(div2, file, 517, 12, 14461);
    			attr_dev(div3, "class", "size-select svelte-oqoyk");
    			attr_dev(div3, "data-selected", "false");
    			add_location(div3, file, 512, 11, 14325);
    			attr_dev(img, "class", "rectangle svelte-oqoyk");
    			if (!src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*imgUrl*/ ctx[7]);
    			add_location(img, file, 524, 12, 14663);
    			attr_dev(div4, "class", "div svelte-oqoyk");
    			add_location(div4, file, 529, 12, 14783);
    			attr_dev(div5, "class", "image-main svelte-oqoyk");
    			add_location(div5, file, 523, 11, 14625);
    			attr_dev(div6, "class", "text-wrapper-2 svelte-oqoyk");
    			add_location(div6, file, 536, 14, 14995);
    			attr_dev(div7, "class", "div-wrapper svelte-oqoyk");
    			add_location(div7, file, 535, 13, 14954);
    			attr_dev(div8, "class", "text-wrapper-3 svelte-oqoyk");
    			add_location(div8, file, 543, 14, 15172);
    			attr_dev(div9, "class", "file-size svelte-oqoyk");
    			add_location(div9, file, 542, 13, 15133);
    			attr_dev(div10, "class", "image-type svelte-oqoyk");
    			add_location(div10, file, 534, 12, 14915);
    			add_location(button0, file, 551, 13, 15366);
    			add_location(button1, file, 555, 13, 15482);
    			attr_dev(div11, "class", "frame svelte-oqoyk");
    			add_location(div11, file, 550, 12, 15332);
    			attr_dev(div12, "class", "image-tail svelte-oqoyk");
    			add_location(div12, file, 533, 11, 14877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div10);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div10, t7);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div12, t9);
    			append_dev(div12, div11);
    			append_dev(div11, button0);
    			append_dev(div11, t11);
    			append_dev(div11, button1);
    			append_dev(div12, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", copyImageUrl, false, false, false, false),
    					listen_dev(button1, "click", click_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*imgUrls*/ 2 && !src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[7])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imgUrls*/ 2 && img_alt_value !== (img_alt_value = /*imgUrl*/ ctx[7])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div12);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(512:10) {#each imgUrls as imgUrl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t1;
    	let div2;
    	let button0;
    	let a0;
    	let t3;
    	let button1;
    	let a1;
    	let t5;
    	let div42;
    	let div41;
    	let div8;
    	let div7;
    	let div4;
    	let span1;
    	let span0;
    	let t7;
    	let br0;
    	let t8;
    	let span3;
    	let span2;
    	let t10;
    	let div6;
    	let div5;
    	let input;
    	let t11;
    	let button2;
    	let t12_value = (/*loading*/ ctx[2] ? "Scraping..." : "Scrape Images") + "";
    	let t12;
    	let t13;
    	let t14;
    	let div40;
    	let div33;
    	let div32;
    	let div12;
    	let br1;
    	let br2;
    	let br3;
    	let t15;
    	let div10;
    	let div9;
    	let label;
    	let t17;
    	let div11;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let t29;
    	let div25;
    	let div13;
    	let t31;
    	let div24;
    	let div15;
    	let div14;
    	let t33;
    	let div17;
    	let div16;
    	let t35;
    	let div19;
    	let div18;
    	let t37;
    	let div21;
    	let div20;
    	let t39;
    	let div23;
    	let div22;
    	let t41;
    	let div30;
    	let div26;
    	let t43;
    	let div28;
    	let div27;
    	let t45;
    	let div29;
    	let t47;
    	let div31;
    	let t48;
    	let div39;
    	let div34;
    	let t49;
    	let div38;
    	let div37;
    	let div36;
    	let div35;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error*/ ctx[3] && create_if_block_2(ctx);
    	let if_block1 = /*imgUrls*/ ctx[1].length > 0 && create_if_block_1(ctx);
    	let if_block2 = /*imgUrls*/ ctx[1].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Image Extractor";
    			t1 = space();
    			div2 = element("div");
    			button0 = element("button");
    			a0 = element("a");
    			a0.textContent = "Login";
    			t3 = space();
    			button1 = element("button");
    			a1 = element("a");
    			a1.textContent = "Sign up";
    			t5 = space();
    			div42 = element("div");
    			div41 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div4 = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "Extract Image";
    			t7 = space();
    			br0 = element("br");
    			t8 = space();
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "from any public website!";
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			input = element("input");
    			t11 = space();
    			button2 = element("button");
    			t12 = text(t12_value);
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			div40 = element("div");
    			div33 = element("div");
    			div32 = element("div");
    			div12 = element("div");
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			t15 = space();
    			div10 = element("div");
    			div9 = element("div");
    			label = element("label");
    			label.textContent = "Sort By:";
    			t17 = space();
    			div11 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Default";
    			option1 = element("option");
    			option1.textContent = "Image Size (Smallest to Largest)";
    			option2 = element("option");
    			option2.textContent = "Image Size (Largest to Smallest)";
    			option3 = element("option");
    			option3.textContent = "File Size (Smallest to Largest)";
    			option4 = element("option");
    			option4.textContent = "File Size (Largest to Smallest)";
    			option5 = element("option");
    			option5.textContent = "Image Width (Smallest to Largest)";
    			option6 = element("option");
    			option6.textContent = "Image Width (Largest to Smallest)";
    			option7 = element("option");
    			option7.textContent = "Image Height (Smallest to Largest)";
    			option8 = element("option");
    			option8.textContent = "Image Height (Largest to Smallest)";
    			option9 = element("option");
    			option9.textContent = "Image Name (A to Z)";
    			option10 = element("option");
    			option10.textContent = "Image Name (Z to A)";
    			t29 = space();
    			div25 = element("div");
    			div13 = element("div");
    			div13.textContent = "Filter images by type";
    			t31 = space();
    			div24 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "ICO (1)";
    			t33 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "PNG (1)";
    			t35 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div18.textContent = "SVG (1)";
    			t37 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div20.textContent = "JPEG (1)";
    			t39 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div22.textContent = "GIF (1)";
    			t41 = space();
    			div30 = element("div");
    			div26 = element("div");
    			div26.textContent = "Search for images";
    			t43 = space();
    			div28 = element("div");
    			div27 = element("div");
    			div27.textContent = "Type to Search....";
    			t45 = space();
    			div29 = element("div");
    			div29.textContent = "Download";
    			t47 = space();
    			div31 = element("div");
    			t48 = space();
    			div39 = element("div");
    			div34 = element("div");
    			if (if_block1) if_block1.c();
    			t49 = space();
    			div38 = element("div");
    			div37 = element("div");
    			div36 = element("div");
    			div35 = element("div");
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "text-wrapper svelte-oqoyk");
    			add_location(div0, file, 261, 2, 7164);
    			attr_dev(div1, "class", "image-extractor svelte-oqoyk");
    			add_location(div1, file, 259, 1, 7069);
    			attr_dev(a0, "class", "button-2 svelte-oqoyk");
    			attr_dev(a0, "href", "/#");
    			add_location(a0, file, 276, 4, 7600);
    			attr_dev(button0, "class", "button-wrapper-2 svelte-oqoyk");
    			add_location(button0, file, 275, 2, 7562);
    			attr_dev(a1, "class", "button-2 svelte-oqoyk");
    			attr_dev(a1, "href", "/#");
    			add_location(a1, file, 279, 4, 7694);
    			attr_dev(button1, "class", "button-wrapper-2 svelte-oqoyk");
    			add_location(button1, file, 278, 2, 7656);
    			attr_dev(div2, "class", "login svelte-oqoyk");
    			add_location(div2, file, 274, 1, 7539);
    			attr_dev(div3, "class", "header svelte-oqoyk");
    			add_location(div3, file, 258, 0, 7046);
    			add_location(span0, file, 288, 29, 7935);
    			attr_dev(span1, "class", "home-text svelte-oqoyk");
    			add_location(span1, file, 288, 5, 7911);
    			add_location(br0, file, 289, 5, 7975);
    			add_location(span2, file, 291, 7, 8022);
    			attr_dev(span3, "class", "home-text02 svelte-oqoyk");
    			add_location(span3, file, 290, 5, 7988);
    			attr_dev(div4, "class", "home-heading");
    			add_location(div4, file, 287, 4, 7878);
    			attr_dev(input, "class", "home-text04 svelte-oqoyk");
    			attr_dev(input, "placeholder", "Enter any URL");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "url");
    			add_location(input, file, 296, 6, 8159);
    			set_style(button2, "color", "black");
    			button2.disabled = /*loading*/ ctx[2];
    			attr_dev(button2, "class", "home-button svelte-oqoyk");
    			add_location(button2, file, 303, 6, 8309);
    			attr_dev(div5, "class", "home-urlbar svelte-oqoyk");
    			add_location(div5, file, 295, 5, 8126);
    			attr_dev(div6, "class", "home-searchbar svelte-oqoyk");
    			add_location(div6, file, 294, 4, 8091);
    			attr_dev(div7, "class", "home-frame14 svelte-oqoyk");
    			add_location(div7, file, 286, 3, 7846);
    			attr_dev(div8, "class", "home-container");
    			add_location(div8, file, 285, 2, 7813);
    			add_location(br1, file, 328, 6, 8845);
    			add_location(br2, file, 328, 10, 8849);
    			add_location(br3, file, 328, 14, 8853);
    			attr_dev(label, "for", "sortOptions");
    			add_location(label, file, 332, 8, 8935);
    			attr_dev(div9, "class", "text-wrapper svelte-oqoyk");
    			add_location(div9, file, 331, 7, 8899);
    			attr_dev(div10, "class", "sort-head svelte-oqoyk");
    			add_location(div10, file, 329, 6, 8865);
    			option0.__value = "default";
    			option0.value = option0.__value;
    			add_location(option0, file, 342, 8, 9264);
    			option1.__value = "sizeAsc";
    			option1.value = option1.__value;
    			add_location(option1, file, 343, 8, 9314);
    			option2.__value = "sizeDesc";
    			option2.value = option2.__value;
    			add_location(option2, file, 346, 8, 9410);
    			option3.__value = "fileSizeAsc";
    			option3.value = option3.__value;
    			add_location(option3, file, 349, 8, 9507);
    			option4.__value = "fileSizeDesc";
    			option4.value = option4.__value;
    			add_location(option4, file, 352, 8, 9606);
    			option5.__value = "widthAsc";
    			option5.value = option5.__value;
    			add_location(option5, file, 355, 8, 9706);
    			option6.__value = "widthDesc";
    			option6.value = option6.__value;
    			add_location(option6, file, 358, 8, 9804);
    			option7.__value = "heightAsc";
    			option7.value = option7.__value;
    			add_location(option7, file, 361, 8, 9903);
    			option8.__value = "heightDesc";
    			option8.value = option8.__value;
    			add_location(option8, file, 364, 8, 10003);
    			option9.__value = "nameAsc";
    			option9.value = option9.__value;
    			add_location(option9, file, 367, 8, 10104);
    			option10.__value = "nameDesc";
    			option10.value = option10.__value;
    			add_location(option10, file, 370, 8, 10187);
    			attr_dev(select, "id", "sortOptions");
    			add_location(select, file, 341, 7, 9204);
    			attr_dev(div11, "class", "sort-menu svelte-oqoyk");
    			add_location(div11, file, 340, 6, 9172);
    			attr_dev(div12, "class", "sort svelte-oqoyk");
    			add_location(div12, file, 327, 5, 8819);
    			attr_dev(div13, "class", "text-wrapper-3 svelte-oqoyk");
    			add_location(div13, file, 377, 6, 10341);
    			attr_dev(div14, "class", "text-wrapper-4 svelte-oqoyk");
    			add_location(div14, file, 380, 8, 10479);
    			attr_dev(div15, "class", "image-type-filter svelte-oqoyk");
    			add_location(div15, file, 379, 7, 10438);
    			attr_dev(div16, "class", "text-wrapper-5 svelte-oqoyk");
    			add_location(div16, file, 383, 8, 10579);
    			attr_dev(div17, "class", "div-wrapper svelte-oqoyk");
    			add_location(div17, file, 382, 7, 10544);
    			attr_dev(div18, "class", "text-wrapper-6 svelte-oqoyk");
    			add_location(div18, file, 386, 8, 10687);
    			attr_dev(div19, "class", "image-type-filter-2 svelte-oqoyk");
    			add_location(div19, file, 385, 7, 10644);
    			attr_dev(div20, "class", "text-wrapper-7 svelte-oqoyk");
    			add_location(div20, file, 389, 8, 10795);
    			attr_dev(div21, "class", "image-type-filter-3 svelte-oqoyk");
    			add_location(div21, file, 388, 7, 10752);
    			attr_dev(div22, "class", "text-wrapper-8 svelte-oqoyk");
    			add_location(div22, file, 392, 8, 10904);
    			attr_dev(div23, "class", "image-type-filter-4 svelte-oqoyk");
    			add_location(div23, file, 391, 7, 10861);
    			attr_dev(div24, "class", "filter-menu svelte-oqoyk");
    			add_location(div24, file, 378, 6, 10404);
    			attr_dev(div25, "class", "filter svelte-oqoyk");
    			add_location(div25, file, 376, 5, 10313);
    			attr_dev(div26, "class", "text-wrapper-9 svelte-oqoyk");
    			add_location(div26, file, 397, 6, 11022);
    			attr_dev(div27, "class", "enter-any-URL svelte-oqoyk");
    			add_location(div27, file, 399, 7, 11111);
    			attr_dev(div28, "class", "url-bar svelte-oqoyk");
    			add_location(div28, file, 398, 6, 11081);
    			attr_dev(div29, "class", "text-wrapper-10 svelte-oqoyk");
    			add_location(div29, file, 401, 6, 11184);
    			attr_dev(div30, "class", "search svelte-oqoyk");
    			add_location(div30, file, 396, 5, 10994);
    			attr_dev(div31, "class", "download-buttons svelte-oqoyk");
    			add_location(div31, file, 403, 5, 11247);
    			attr_dev(div32, "class", "side-bar-sort svelte-oqoyk");
    			add_location(div32, file, 326, 4, 8785);
    			attr_dev(div33, "class", "main-res-frame-2 svelte-oqoyk");
    			attr_dev(div33, "id", "resultsContainer");
    			set_style(div33, "display", "none");
    			add_location(div33, file, 320, 3, 8679);
    			attr_dev(div34, "class", "horizontal svelte-oqoyk");
    			add_location(div34, file, 456, 5, 12824);
    			attr_dev(div35, "class", "property-hover svelte-oqoyk");
    			add_location(div35, file, 509, 8, 14212);
    			attr_dev(div36, "class", "image-frame svelte-oqoyk");
    			add_location(div36, file, 508, 7, 14177);
    			attr_dev(div37, "class", "box svelte-oqoyk");
    			add_location(div37, file, 507, 6, 14151);
    			attr_dev(div38, "class", "vertical");
    			set_style(div38, "display", "none");
    			add_location(div38, file, 506, 5, 14098);
    			attr_dev(div39, "class", "res-frame svelte-oqoyk");
    			add_location(div39, file, 446, 4, 12446);
    			attr_dev(div40, "class", "main-res-frame svelte-oqoyk");
    			add_location(div40, file, 319, 2, 8646);
    			attr_dev(div41, "class", "div svelte-oqoyk");
    			add_location(div41, file, 284, 1, 7792);
    			attr_dev(div42, "class", "res-load svelte-oqoyk");
    			add_location(div42, file, 283, 0, 7767);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, a0);
    			append_dev(div2, t3);
    			append_dev(div2, button1);
    			append_dev(button1, a1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div42, anchor);
    			append_dev(div42, div41);
    			append_dev(div41, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, span1);
    			append_dev(span1, span0);
    			append_dev(div4, t7);
    			append_dev(div4, br0);
    			append_dev(div4, t8);
    			append_dev(div4, span3);
    			append_dev(span3, span2);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, input);
    			set_input_value(input, /*url*/ ctx[0]);
    			append_dev(div5, t11);
    			append_dev(div5, button2);
    			append_dev(button2, t12);
    			append_dev(div5, t13);
    			if (if_block0) if_block0.m(div5, null);
    			append_dev(div41, t14);
    			append_dev(div41, div40);
    			append_dev(div40, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div12);
    			append_dev(div12, br1);
    			append_dev(div12, br2);
    			append_dev(div12, br3);
    			append_dev(div12, t15);
    			append_dev(div12, div10);
    			append_dev(div10, div9);
    			append_dev(div9, label);
    			append_dev(div12, t17);
    			append_dev(div12, div11);
    			append_dev(div11, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			append_dev(select, option7);
    			append_dev(select, option8);
    			append_dev(select, option9);
    			append_dev(select, option10);
    			append_dev(div32, t29);
    			append_dev(div32, div25);
    			append_dev(div25, div13);
    			append_dev(div25, t31);
    			append_dev(div25, div24);
    			append_dev(div24, div15);
    			append_dev(div15, div14);
    			append_dev(div24, t33);
    			append_dev(div24, div17);
    			append_dev(div17, div16);
    			append_dev(div24, t35);
    			append_dev(div24, div19);
    			append_dev(div19, div18);
    			append_dev(div24, t37);
    			append_dev(div24, div21);
    			append_dev(div21, div20);
    			append_dev(div24, t39);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div32, t41);
    			append_dev(div32, div30);
    			append_dev(div30, div26);
    			append_dev(div30, t43);
    			append_dev(div30, div28);
    			append_dev(div28, div27);
    			append_dev(div30, t45);
    			append_dev(div30, div29);
    			append_dev(div32, t47);
    			append_dev(div32, div31);
    			append_dev(div40, t48);
    			append_dev(div40, div39);
    			append_dev(div39, div34);
    			if (if_block1) if_block1.m(div34, null);
    			append_dev(div39, t49);
    			append_dev(div39, div38);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			if (if_block2) if_block2.m(div35, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button2, "click", /*scrape*/ ctx[4], false, false, false, false),
    					listen_dev(button2, "click", showResults, false, false, false, false),
    					listen_dev(select, "change", applyFilters, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*url*/ 1 && input.value !== /*url*/ ctx[0]) {
    				set_input_value(input, /*url*/ ctx[0]);
    			}

    			if (dirty & /*loading*/ 4 && t12_value !== (t12_value = (/*loading*/ ctx[2] ? "Scraping..." : "Scrape Images") + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*loading*/ 4) {
    				prop_dev(button2, "disabled", /*loading*/ ctx[2]);
    			}

    			if (/*error*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div5, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*imgUrls*/ ctx[1].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div34, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*imgUrls*/ ctx[1].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(div35, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div42);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function showResults() {
    	var urlInput = document.getElementById("url").value;

    	if (urlInput) {
    		// Assuming the 'mainresframe-container' is the div you want to display
    		var resultsContainer = document.getElementById("resultsContainer");

    		resultsContainer.style.display = "block";
    	} // Hide other elements if needed
    	// ...
    }

    // function toggleImageOrientation() {
    // 	const horizontalImage = document.querySelector(".horizontal");
    // 	const verticalImage = document.querySelector(".vertical");
    // 	if (horizontalImage.style.display === "block") {
    // 		horizontalImage.style.display = "none";
    // 		verticalImage.style.display = "block";
    // 	} else {
    // 		horizontalImage.style.display = "block";
    // 		verticalImage.style.display = "none";
    // 	}
    // }
    function applyFilters() {
    	const imageType = document.getElementById("imageType").value;
    	const sortOption = document.getElementById("sortOptions").value;
    	const images = document.querySelectorAll(".horizontal .image-frame-vertical .frame-2 img");

    	images.forEach(image => {
    		let shouldDisplay = true;

    		// Check image type
    		if (imageType !== "all") {
    			const fileType = image.src.split(".").pop().toLowerCase();

    			if (fileType !== imageType) {
    				shouldDisplay = false;
    			}
    		}

    		image.style.display = shouldDisplay ? "inline-block" : "none";
    	});

    	// Sorting options
    	switch (sortOption) {
    		case "sizeAsc":
    			sortImagesBySize(images, true);
    			break;
    		case "sizeDesc":
    			sortImagesBySize(images, false);
    			break;
    		case "fileSizeAsc":
    			sortImagesByFileSize(images, true);
    			break;
    		case "fileSizeDesc":
    			sortImagesByFileSize(images, false);
    			break;
    		case "widthAsc":
    			sortImagesByDimension(images, "width", true);
    			break;
    		case "widthDesc":
    			sortImagesByDimension(images, "width", false);
    			break;
    		case "heightAsc":
    			sortImagesByDimension(images, "height", true);
    			break;
    		case "heightDesc":
    			sortImagesByDimension(images, "height", false);
    			break;
    		case "nameAsc":
    			sortImagesByName(images, true);
    			break;
    		case "nameDesc":
    			sortImagesByName(images, false);
    			break;
    	}

    	// Hide the download button for non-visible images
    	images.forEach(image => {
    		const imageItem = image.closest(".image-frame-vertical");

    		if (imageItem) {
    			imageItem.querySelector("button").style.display = image.style.display;
    		}
    	});

    	// Add click event listener to toggle selection
    	images.forEach(image => {
    		image.addEventListener("click", () => {
    			
    		}); // toggleSelection(image);
    	});

    	// Add click event listener to toggle selection
    	images.forEach(image => {
    		image.addEventListener("click", () => {
    			console.log("Image clicked:", image.src);
    		}); // toggleSelection(image);
    	});
    }

    function sortImagesBySize(images, ascending) {
    	images.forEach(image => image.setAttribute("data-size", image.src.length));
    	imagesContainer = document.querySelector(".horizontal .image-frame-vertical .frame-2");

    	[...images].sort((a, b) => ascending
    	? a.getAttribute("data-size") - b.getAttribute("data-size")
    	: b.getAttribute("data-size") - a.getAttribute("data-size")).forEach(image => imagesContainer.appendChild(image));
    }

    function sortImagesByFileSize(images, ascending) {
    	images.forEach(image => image.setAttribute("data-size", image.src.length));
    	imagesContainer = document.querySelector(".horizontal .image-frame-vertical .frame-2");

    	[...images].sort((a, b) => ascending
    	? a.getAttribute("data-size") - b.getAttribute("data-size")
    	: b.getAttribute("data-size") - a.getAttribute("data-size")).forEach(image => imagesContainer.appendChild(image));
    }

    function sortImagesByDimension(images, dimension, ascending) {
    	images.forEach(image => image.setAttribute(`data-${dimension}`, image.naturalWidth));
    	imagesContainer = document.querySelector(".horizontal .image-frame-vertical .frame-2");

    	[...images].sort((a, b) => ascending
    	? a.getAttribute(`data-${dimension}`) - b.getAttribute(`data-${dimension}`)
    	: b.getAttribute(`data-${dimension}`) - a.getAttribute(`data-${dimension}`)).forEach(image => imagesContainer.appendChild(image));
    }

    function sortImagesByName(images, ascending) {
    	images.forEach(image => image.setAttribute("data-name", image.alt.toLowerCase()));
    	imagesContainer = document.querySelector(".horizontal .image-frame-vertical .frame-2");

    	[...images].sort((a, b) => ascending
    	? a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"))
    	: b.getAttribute("data-name").localeCompare(a.getAttribute("data-name"))).forEach(image => imagesContainer.appendChild(image));
    }

    function downloadImage(imageSrc, fileName) {
    	const link = document.createElement("a");
    	link.href = imageSrc;
    	link.download = fileName;
    	document.body.appendChild(link);
    	link.click();
    	document.body.removeChild(link);
    }

    function selectAll() {
    	const images = document.querySelectorAll(".horizontal .image-frame-vertical .frame-2 img");

    	images.forEach(image => {
    		image.setAttribute("data-selected", "true");
    		image.style.border = "2px solid blue";
    	});
    }

    function deselectAll() {
    	const images = document.querySelectorAll(".horizontal .image-frame-vertical .frame-2 img");

    	images.forEach(image => {
    		image.setAttribute("data-selected", "false");
    		image.style.border = "1px solid #ccc";
    	});
    }

    function copyImageUrl() {
    	var image = document.getElementById("imageToCopy");

    	// Ensure an image is selected
    	if (image && image.src) {
    		var imageUrl = image.src;
    		copyToClipboard(imageUrl);
    		alert("Image URL copied to clipboard: " + imageUrl);
    	}
    }

    function copyToClipboard(text) {
    	var textarea = document.createElement("textarea");
    	textarea.value = text;
    	document.body.appendChild(textarea);
    	textarea.select();
    	document.execCommand("copy");
    	document.body.removeChild(textarea);
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let url = "";
    	let imgUrls = [];
    	let loading = false;
    	let error = null;

    	const scrape = async () => {
    		$$invalidate(2, loading = true);
    		$$invalidate(3, error = null);

    		try {
    			const response = await fetch("http://localhost:5000/api/scrape", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ url })
    			});

    			const data = await response.json();

    			if (data.success) {
    				$$invalidate(1, imgUrls = data.imgUrls);
    			} else {
    				$$invalidate(3, error = data.error);
    			}
    		} catch(error) {
    			console.error("Error:", error);
    			error = "An error occurred during the scraping process.";
    		} finally {
    			$$invalidate(2, loading = false);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		url = this.value;
    		$$invalidate(0, url);
    	}

    	const click_handler = imgUrl => downloadImage({ imgUrl }, { imgUrl });

    	$$self.$capture_state = () => ({
    		url,
    		imgUrls,
    		loading,
    		error,
    		scrape,
    		showResults,
    		applyFilters,
    		sortImagesBySize,
    		sortImagesByFileSize,
    		sortImagesByDimension,
    		sortImagesByName,
    		downloadImage,
    		selectAll,
    		deselectAll,
    		copyImageUrl,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('imgUrls' in $$props) $$invalidate(1, imgUrls = $$props.imgUrls);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    		if ('error' in $$props) $$invalidate(3, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, imgUrls, loading, error, scrape, input_input_handler, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
