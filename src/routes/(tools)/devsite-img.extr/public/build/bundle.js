
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (469:6) {#if imgUrls.length > 0}
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
    		source: "(469:6) {#if imgUrls.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (470:7) {#each imgUrls as imgUrl}
    function create_each_block(ctx) {
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
    	let button0;
    	let t8;
    	let button1;
    	let t10;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*imgUrl*/ ctx[11]);
    	}

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
    			button0 = element("button");
    			button0.textContent = "Copy Image URL";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Download";
    			t10 = space();
    			attr_dev(img, "class", "rectangle svelte-18gi4ei");
    			if (!src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image1");
    			attr_dev(img, "id", "imageToCopy");
    			add_location(img, file, 475, 10, 12725);
    			attr_dev(div0, "class", "text-wrapper-14 svelte-18gi4ei");
    			add_location(div0, file, 481, 10, 12858);
    			attr_dev(div1, "class", "frame-2 svelte-18gi4ei");
    			add_location(div1, file, 474, 9, 12693);
    			attr_dev(div2, "class", "text-wrapper-15 svelte-18gi4ei");
    			add_location(div2, file, 487, 11, 13019);
    			attr_dev(div3, "class", "file-size svelte-18gi4ei");
    			add_location(div3, file, 486, 10, 12984);
    			attr_dev(div4, "class", "text-wrapper-4 svelte-18gi4ei");
    			add_location(div4, file, 492, 11, 13149);
    			attr_dev(div5, "class", "image-type svelte-18gi4ei");
    			add_location(div5, file, 491, 10, 13113);
    			add_location(button0, file, 497, 11, 13272);
    			add_location(button1, file, 500, 11, 13364);
    			attr_dev(div6, "class", "frame-4 svelte-18gi4ei");
    			add_location(div6, file, 496, 10, 13239);
    			attr_dev(div7, "class", "frame-3 svelte-18gi4ei");
    			add_location(div7, file, 485, 9, 12952);
    			attr_dev(div8, "class", "image-frame-vertical svelte-18gi4ei");
    			attr_dev(div8, "data-selected", "false");
    			add_location(div8, file, 470, 8, 12600);
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
    			append_dev(div6, button0);
    			append_dev(div6, t8);
    			append_dev(div6, button1);
    			append_dev(div8, t10);

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

    			if (dirty & /*imgUrls*/ 2 && !src_url_equal(img.src, img_src_value = /*imgUrl*/ ctx[11])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(470:7) {#each imgUrls as imgUrl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let nav;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let span1;
    	let span0;
    	let t4;
    	let br0;
    	let br1;
    	let t5;
    	let span3;
    	let span2;
    	let t7;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t9;
    	let li1;
    	let a1;
    	let t11;
    	let li2;
    	let a2;
    	let t13;
    	let ul1;
    	let li3;
    	let a3;
    	let span4;
    	let t14;
    	let t15;
    	let li4;
    	let a4;
    	let span5;
    	let t16;
    	let t17;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let input;
    	let t18;
    	let button0;
    	let t19_value = (/*loading*/ ctx[2] ? "Scraping..." : "Scrape Images") + "";
    	let t19;
    	let t20;
    	let div20;
    	let div19;
    	let div18;
    	let div17;
    	let div13;
    	let div12;
    	let div11;
    	let div6;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let div5;
    	let button1;
    	let t23;
    	let div8;
    	let img2;
    	let img2_src_value;
    	let t24;
    	let div7;
    	let button2;
    	let t26;
    	let div10;
    	let div9;
    	let button3;
    	let t28;
    	let br2;
    	let t29;
    	let div16;
    	let div14;
    	let p0;
    	let span6;
    	let t31;
    	let span7;
    	let t32;
    	let t33;
    	let div15;
    	let t34;
    	let br3;
    	let t35;
    	let br4;
    	let t36;
    	let br5;
    	let t37;
    	let section0;
    	let h1;
    	let t39;
    	let br6;
    	let t40;
    	let div24;
    	let div21;
    	let img3;
    	let img3_src_value;
    	let t41;
    	let h30;
    	let t43;
    	let h50;
    	let t45;
    	let div22;
    	let img4;
    	let img4_src_value;
    	let t46;
    	let h31;
    	let t48;
    	let h51;
    	let t50;
    	let div23;
    	let img5;
    	let img5_src_value;
    	let t51;
    	let h32;
    	let t53;
    	let h52;
    	let t55;
    	let hr0;
    	let t56;
    	let section1;
    	let h2;
    	let t58;
    	let br7;
    	let t59;
    	let div25;
    	let h33;
    	let t61;
    	let p1;
    	let t63;
    	let div26;
    	let h34;
    	let t65;
    	let p2;
    	let t67;
    	let section2;
    	let hr1;
    	let t68;
    	let h35;
    	let t70;
    	let h40;
    	let t72;
    	let p3;
    	let t74;
    	let br8;
    	let t75;
    	let section3;
    	let h36;
    	let p4;
    	let h41;
    	let a5;
    	let t78;
    	let a6;
    	let t80;
    	let p5;
    	let t82;
    	let p6;
    	let mounted;
    	let dispose;
    	let if_block = /*imgUrls*/ ctx[1].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			nav = element("nav");
    			img0 = element("img");
    			t2 = space();
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "Extract Image";
    			t4 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t5 = space();
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "from any public website!";
    			t7 = space();
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t9 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About us";
    			t11 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Help Center";
    			t13 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a3 = element("a");
    			span4 = element("span");
    			t14 = text(" Sign Up");
    			t15 = space();
    			li4 = element("li");
    			a4 = element("a");
    			span5 = element("span");
    			t16 = text(" Login");
    			t17 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t18 = space();
    			button0 = element("button");
    			t19 = text(t19_value);
    			t20 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div6 = element("div");
    			img1 = element("img");
    			t21 = space();
    			div5 = element("div");
    			button1 = element("button");
    			button1.textContent = "Select All";
    			t23 = space();
    			div8 = element("div");
    			img2 = element("img");
    			t24 = space();
    			div7 = element("div");
    			button2 = element("button");
    			button2.textContent = "Deselect All";
    			t26 = space();
    			div10 = element("div");
    			div9 = element("div");
    			button3 = element("button");
    			button3.textContent = "Download Selected";
    			t28 = space();
    			br2 = element("br");
    			t29 = space();
    			div16 = element("div");
    			div14 = element("div");
    			p0 = element("p");
    			span6 = element("span");
    			span6.textContent = "Showing images from";
    			t31 = space();
    			span7 = element("span");
    			t32 = text(/*url*/ ctx[0]);
    			t33 = space();
    			div15 = element("div");
    			if (if_block) if_block.c();
    			t34 = space();
    			br3 = element("br");
    			t35 = space();
    			br4 = element("br");
    			t36 = space();
    			br5 = element("br");
    			t37 = space();
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Why Choose Us?";
    			t39 = space();
    			br6 = element("br");
    			t40 = space();
    			div24 = element("div");
    			div21 = element("div");
    			img3 = element("img");
    			t41 = space();
    			h30 = element("h3");
    			h30.textContent = "Efficiency";
    			t43 = space();
    			h50 = element("h5");
    			h50.textContent = "Save time and effort with our automated image extraction process.";
    			t45 = space();
    			div22 = element("div");
    			img4 = element("img");
    			t46 = space();
    			h31 = element("h3");
    			h31.textContent = "User-Friendly";
    			t48 = space();
    			h51 = element("h5");
    			h51.textContent = "Our intuitive interface makes the process accessible to all.";
    			t50 = space();
    			div23 = element("div");
    			img5 = element("img");
    			t51 = space();
    			h32 = element("h3");
    			h32.textContent = "Volunteer";
    			t53 = space();
    			h52 = element("h5");
    			h52.textContent = "Tailor your image extraction settings to suit your needs.";
    			t55 = space();
    			hr0 = element("hr");
    			t56 = space();
    			section1 = element("section");
    			h2 = element("h2");
    			h2.textContent = "Frequently Asked Questions:";
    			t58 = space();
    			br7 = element("br");
    			t59 = space();
    			div25 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Can I download multiple images at once?";
    			t61 = space();
    			p1 = element("p");
    			p1.textContent = "Of course, you can select them by clicking the images and then use the \"Download selected\" button on the left to download all selected images in a ZIP file. This can take some time depending on how many images you selected. Note that there is a chance that some images cannot be downloaded and won't be included in the ZIP file.";
    			t63 = space();
    			div26 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Why might the extraction process not work?";
    			t65 = space();
    			p2 = element("p");
    			p2.textContent = "There are several reasons why the extraction might fail. The website you entered might not be publicly accessible or it might be protected by a login. Very slow or large websites might also cause issues. Additionally, if there are a lot of people using our website at the same time, it can cause performance issues on our side. In this case, you should try again later or try a different website. We are continuously working on improving the performance of our service.";
    			t67 = space();
    			section2 = element("section");
    			hr1 = element("hr");
    			t68 = space();
    			h35 = element("h3");
    			h35.textContent = "About Us";
    			t70 = space();
    			h40 = element("h4");
    			h40.textContent = "VisualHarbor: Your Gateway to Seamless Image Extraction !";
    			t72 = space();
    			p3 = element("p");
    			p3.textContent = "Welcome to VisualHarbor, where the art of visual storytelling meets efficiency. Our passion drives our mission – to transform the landscape of image gathering on the web for individuals, designers, content creators, and researchers alike.\n\tBehind VisualHarbor is a dedicated team of professionals committed to simplifying the process of image extraction. We recognize the potency of visuals in communication, creativity, and knowledge sharing. Therefore, our goal is clear: to empower you with tools that effortlessly streamline the collection and utilization of images.\n\tOur platform offers a user-friendly experience, allowing you to extract images seamlessly from web pages, URLs, and online documents. It's a one-stop solution for all your visual content needs, designed to enhance your efficiency and elevate your projects, research, or creative endeavors.\n\tAt VisualHarbor, we understand the value of your time and energy. Our commitment is to help you save both, enabling you to focus on what truly matters – whether it's crafting exceptional projects, conducting groundbreaking research, or unleashing your creative genius.\n\tEmbark on this visual journey with us, and together, let's paint the digital world with vibrant expressions, one extracted image at a time. VisualHarbor – where visuals meet simplicity and creativity knows no bounds.";
    			t74 = space();
    			br8 = element("br");
    			t75 = space();
    			section3 = element("section");
    			h36 = element("h3");
    			h36.textContent = "Contact Us";
    			p4 = element("p");
    			h41 = element("h4");
    			a5 = element("a");
    			a5.textContent = "dvstrimgextractor@gmail.com";
    			t78 = space();
    			a6 = element("a");
    			a6.textContent = "+91 12345678910";
    			t80 = space();
    			p5 = element("p");
    			p5.textContent = "Designed By: dvstr-image-extractor";
    			t82 = space();
    			p6 = element("p");
    			p6.textContent = "Some images used under license from Shutterstock, Google. © 2023 Pawsome. All rights reserved.";
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://use.fontawesome.com/releases/v5.5.0/css/all.css");
    			attr_dev(link0, "integrity", "sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU");
    			attr_dev(link0, "crossorigin", "anonymous");
    			add_location(link0, file, 276, 0, 7173);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css");
    			add_location(link1, file, 277, 0, 7368);
    			set_style(img0, "height", "100px");
    			set_style(img0, "width", "100px");
    			attr_dev(img0, "class", "image");
    			if (!src_url_equal(img0.src, img0_src_value = "img/image.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "1");
    			add_location(img0, file, 281, 1, 7534);
    			add_location(span0, file, 283, 62, 7681);
    			set_style(span1, "color", "black");
    			set_style(span1, "margin-left", "30px");
    			attr_dev(span1, "class", "home-text svelte-18gi4ei");
    			add_location(span1, file, 283, 1, 7620);
    			add_location(br0, file, 284, 1, 7716);
    			add_location(br1, file, 284, 7, 7722);
    			add_location(span2, file, 287, 3, 7813);
    			attr_dev(span3, "class", "home-text02 svelte-18gi4ei");
    			set_style(span3, "color", "black");
    			set_style(span3, "margin-top", "80px");
    			set_style(span3, "margin-left", "10px");
    			add_location(span3, file, 286, 1, 7730);
    			attr_dev(a0, "class", "nav-link");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 292, 8, 8010);
    			attr_dev(li0, "class", "nav-item active");
    			add_location(li0, file, 291, 6, 7973);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#aboutus");
    			add_location(a1, file, 295, 8, 8096);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file, 294, 6, 8066);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "#faq");
    			add_location(a2, file, 298, 8, 8193);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file, 297, 6, 8163);
    			attr_dev(ul0, "class", "navbar-nav");
    			set_style(ul0, "font-size", "20px");
    			add_location(ul0, file, 290, 4, 7920);
    			attr_dev(span4, "class", "fas fa-user");
    			add_location(span4, file, 304, 37, 8369);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 304, 8, 8340);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file, 303, 6, 8310);
    			attr_dev(span5, "class", "fas fa-sign-in-alt");
    			add_location(span5, file, 307, 37, 8492);
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file, 307, 8, 8463);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file, 306, 6, 8433);
    			attr_dev(ul1, "class", "nav navbar-nav ml-auto");
    			add_location(ul1, file, 302, 4, 8268);
    			attr_dev(div0, "id", "navb");
    			attr_dev(div0, "class", "navbar-collapse collapse hide");
    			add_location(div0, file, 289, 2, 7862);
    			attr_dev(nav, "class", "navbar navbar-expand-md navbar-light bg-light");
    			add_location(nav, file, 280, 0, 7473);
    			set_style(input, "color", "white");
    			set_style(input, "font-size", "20px");
    			attr_dev(input, "class", "home-text05 svelte-18gi4ei");
    			attr_dev(input, "placeholder", "Enter any URL");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "url");
    			add_location(input, file, 323, 5, 8760);
    			button0.disabled = /*loading*/ ctx[2];
    			attr_dev(button0, "class", "home-button svelte-18gi4ei");
    			set_style(button0, "margin-left", "380px");
    			add_location(button0, file, 330, 5, 8932);
    			attr_dev(div1, "class", "home-urlbar svelte-18gi4ei");
    			set_style(div1, "margin-left", "300px");
    			set_style(div1, "margin-top", "200px");
    			add_location(div1, file, 322, 4, 8683);
    			attr_dev(div2, "class", "home-searchbar svelte-18gi4ei");
    			add_location(div2, file, 321, 3, 8650);
    			attr_dev(div3, "class", "home-container");
    			add_location(div3, file, 319, 2, 8614);
    			attr_dev(div4, "class", "header svelte-18gi4ei");
    			add_location(div4, file, 317, 1, 8589);
    			attr_dev(img1, "class", "img svelte-18gi4ei");
    			if (!src_url_equal(img1.src, img1_src_value = "img/check-circle.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "a");
    			add_location(img1, file, 425, 8, 11490);
    			add_location(button1, file, 431, 9, 11627);
    			attr_dev(div5, "class", "text-wrapper-11 svelte-18gi4ei");
    			add_location(div5, file, 430, 8, 11588);
    			attr_dev(div6, "class", "white-button svelte-18gi4ei");
    			add_location(div6, file, 424, 7, 11455);
    			attr_dev(img2, "class", "img svelte-18gi4ei");
    			if (!src_url_equal(img2.src, img2_src_value = "img/radio-button-unchecked.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "h");
    			add_location(img2, file, 437, 8, 11768);
    			add_location(button2, file, 443, 9, 11915);
    			attr_dev(div7, "class", "text-wrapper-11 svelte-18gi4ei");
    			add_location(div7, file, 442, 8, 11876);
    			attr_dev(div8, "class", "white-button svelte-18gi4ei");
    			add_location(div8, file, 436, 7, 11733);
    			set_style(button3, "color", "green");
    			add_location(button3, file, 451, 8, 12105);
    			attr_dev(div9, "class", "text-wrapper-11 svelte-18gi4ei");
    			add_location(div9, file, 450, 7, 12067);
    			attr_dev(div10, "class", "white-button svelte-18gi4ei");
    			add_location(div10, file, 448, 7, 12025);
    			attr_dev(div11, "class", "select-deselect svelte-18gi4ei");
    			add_location(div11, file, 423, 6, 11418);
    			attr_dev(div12, "class", "download-buttons svelte-18gi4ei");
    			add_location(div12, file, 422, 5, 11381);
    			attr_dev(div13, "class", "side-bar-sort svelte-18gi4ei");
    			add_location(div13, file, 357, 4, 9372);
    			add_location(br2, file, 459, 4, 12267);
    			attr_dev(span6, "class", "span svelte-18gi4ei");
    			add_location(span6, file, 463, 7, 12378);
    			attr_dev(span7, "class", "text-wrapper-13 svelte-18gi4ei");
    			add_location(span7, file, 464, 7, 12432);
    			attr_dev(p0, "class", "showing-images-from svelte-18gi4ei");
    			add_location(p0, file, 462, 6, 12339);
    			attr_dev(div14, "class", "result-header svelte-18gi4ei");
    			add_location(div14, file, 461, 5, 12305);
    			attr_dev(div15, "class", "horizontal svelte-18gi4ei");
    			add_location(div15, file, 467, 5, 12503);
    			attr_dev(div16, "class", "res-frame svelte-18gi4ei");
    			add_location(div16, file, 460, 4, 12276);
    			attr_dev(div17, "class", "main-res-frame-2 svelte-18gi4ei");
    			attr_dev(div17, "id", "resultsContainer");
    			set_style(div17, "display", "none");
    			add_location(div17, file, 352, 3, 9276);
    			attr_dev(div18, "class", "main-res-frame svelte-18gi4ei");
    			add_location(div18, file, 351, 2, 9244);
    			attr_dev(div19, "class", "div svelte-18gi4ei");
    			add_location(div19, file, 348, 1, 9218);
    			attr_dev(div20, "class", "res-load svelte-18gi4ei");
    			add_location(div20, file, 347, 0, 9194);
    			add_location(br3, file, 518, 0, 13654);
    			add_location(br4, file, 519, 0, 13659);
    			add_location(br5, file, 520, 0, 13664);
    			attr_dev(h1, "class", "svelte-18gi4ei");
    			add_location(h1, file, 522, 1, 13697);
    			add_location(br6, file, 523, 1, 13722);
    			if (!src_url_equal(img3.src, img3_src_value = "img/1_serv.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Service Image 1");
    			attr_dev(img3, "class", "svelte-18gi4ei");
    			add_location(img3, file, 526, 2, 13779);
    			attr_dev(h30, "class", "svelte-18gi4ei");
    			add_location(h30, file, 527, 2, 13830);
    			attr_dev(h50, "class", "svelte-18gi4ei");
    			add_location(h50, file, 529, 2, 13854);
    			attr_dev(div21, "class", "services-col svelte-18gi4ei");
    			add_location(div21, file, 525, 3, 13750);
    			if (!src_url_equal(img4.src, img4_src_value = "img/2_serv.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Service Image 2");
    			attr_dev(img4, "class", "svelte-18gi4ei");
    			add_location(img4, file, 532, 2, 13971);
    			attr_dev(h31, "class", "svelte-18gi4ei");
    			add_location(h31, file, 533, 2, 14022);
    			attr_dev(h51, "class", "svelte-18gi4ei");
    			add_location(h51, file, 535, 2, 14048);
    			attr_dev(div22, "class", "services-col svelte-18gi4ei");
    			add_location(div22, file, 531, 3, 13942);
    			if (!src_url_equal(img5.src, img5_src_value = "img/3_serv.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Service Image 3");
    			attr_dev(img5, "class", "svelte-18gi4ei");
    			add_location(img5, file, 538, 2, 14160);
    			attr_dev(h32, "class", "svelte-18gi4ei");
    			add_location(h32, file, 539, 2, 14211);
    			attr_dev(h52, "class", "svelte-18gi4ei");
    			add_location(h52, file, 540, 2, 14232);
    			attr_dev(div23, "class", "services-col svelte-18gi4ei");
    			add_location(div23, file, 537, 3, 14131);
    			attr_dev(div24, "class", "row svelte-18gi4ei");
    			add_location(div24, file, 524, 2, 13729);
    			attr_dev(section0, "class", "services svelte-18gi4ei");
    			add_location(section0, file, 521, 0, 13669);
    			add_location(hr0, file, 545, 2, 14336);
    			add_location(h2, file, 548, 1, 14380);
    			add_location(br7, file, 549, 1, 14418);
    			add_location(h33, file, 553, 1, 14433);
    			add_location(p1, file, 554, 1, 14483);
    			add_location(div25, file, 552, 1, 14426);
    			add_location(h34, file, 561, 1, 14843);
    			add_location(p2, file, 562, 1, 14896);
    			add_location(div26, file, 560, 1, 14836);
    			attr_dev(section1, "class", "FAQ");
    			attr_dev(section1, "id", "faq");
    			add_location(section1, file, 547, 2, 14348);
    			add_location(hr1, file, 571, 1, 15435);
    			add_location(h35, file, 572, 1, 15441);
    			attr_dev(h40, "class", "svelte-18gi4ei");
    			add_location(h40, file, 573, 1, 15460);
    			attr_dev(section2, "class", "aboutus svelte-18gi4ei");
    			add_location(section2, file, 570, 2, 15407);
    			add_location(p3, file, 575, 2, 15542);
    			add_location(br8, file, 582, 2, 16906);
    			attr_dev(h36, "class", "svelte-18gi4ei");
    			add_location(h36, file, 584, 1, 16951);
    			add_location(p4, file, 584, 20, 16970);
    			attr_dev(a5, "href", "mailto:dvstrimgextractor@gmail.com");
    			add_location(a5, file, 586, 5, 16980);
    			attr_dev(a6, "href", "tel:+9112345678910");
    			add_location(a6, file, 587, 2, 17060);
    			add_location(h41, file, 586, 1, 16976);
    			add_location(p5, file, 588, 1, 17115);
    			add_location(p6, file, 589, 0, 17157);
    			attr_dev(section3, "class", "footer svelte-18gi4ei");
    			attr_dev(section3, "id", "aboutus");
    			add_location(section3, file, 583, 2, 16913);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, img0);
    			append_dev(nav, t2);
    			append_dev(nav, span1);
    			append_dev(span1, span0);
    			append_dev(nav, t4);
    			append_dev(nav, br0);
    			append_dev(nav, br1);
    			append_dev(nav, t5);
    			append_dev(nav, span3);
    			append_dev(span3, span2);
    			append_dev(nav, t7);
    			append_dev(nav, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t9);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t11);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(div0, t13);
    			append_dev(div0, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a3);
    			append_dev(a3, span4);
    			append_dev(a3, t14);
    			append_dev(ul1, t15);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(a4, span5);
    			append_dev(a4, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*url*/ ctx[0]);
    			append_dev(div1, t18);
    			append_dev(div1, button0);
    			append_dev(button0, t19);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div20, anchor);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div6);
    			append_dev(div6, img1);
    			append_dev(div6, t21);
    			append_dev(div6, div5);
    			append_dev(div5, button1);
    			append_dev(div11, t23);
    			append_dev(div11, div8);
    			append_dev(div8, img2);
    			append_dev(div8, t24);
    			append_dev(div8, div7);
    			append_dev(div7, button2);
    			append_dev(div11, t26);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, button3);
    			append_dev(div17, t28);
    			append_dev(div17, br2);
    			append_dev(div17, t29);
    			append_dev(div17, div16);
    			append_dev(div16, div14);
    			append_dev(div14, p0);
    			append_dev(p0, span6);
    			append_dev(p0, t31);
    			append_dev(p0, span7);
    			append_dev(span7, t32);
    			append_dev(div16, t33);
    			append_dev(div16, div15);
    			if (if_block) if_block.m(div15, null);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h1);
    			append_dev(section0, t39);
    			append_dev(section0, br6);
    			append_dev(section0, t40);
    			append_dev(section0, div24);
    			append_dev(div24, div21);
    			append_dev(div21, img3);
    			append_dev(div21, t41);
    			append_dev(div21, h30);
    			append_dev(div21, t43);
    			append_dev(div21, h50);
    			append_dev(div24, t45);
    			append_dev(div24, div22);
    			append_dev(div22, img4);
    			append_dev(div22, t46);
    			append_dev(div22, h31);
    			append_dev(div22, t48);
    			append_dev(div22, h51);
    			append_dev(div24, t50);
    			append_dev(div24, div23);
    			append_dev(div23, img5);
    			append_dev(div23, t51);
    			append_dev(div23, h32);
    			append_dev(div23, t53);
    			append_dev(div23, h52);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h2);
    			append_dev(section1, t58);
    			append_dev(section1, br7);
    			append_dev(section1, t59);
    			append_dev(section1, div25);
    			append_dev(div25, h33);
    			append_dev(div25, t61);
    			append_dev(div25, p1);
    			append_dev(section1, t63);
    			append_dev(section1, div26);
    			append_dev(div26, h34);
    			append_dev(div26, t65);
    			append_dev(div26, p2);
    			insert_dev(target, t67, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, hr1);
    			append_dev(section2, t68);
    			append_dev(section2, h35);
    			append_dev(section2, t70);
    			append_dev(section2, h40);
    			insert_dev(target, t72, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t74, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t75, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, h36);
    			append_dev(section3, p4);
    			append_dev(section3, h41);
    			append_dev(h41, a5);
    			append_dev(h41, t78);
    			append_dev(h41, a6);
    			append_dev(section3, t80);
    			append_dev(section3, p5);
    			append_dev(section3, t82);
    			append_dev(section3, p6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button0, "click", /*scrape*/ ctx[3], false, false, false, false),
    					listen_dev(button0, "click", showResults, false, false, false, false),
    					listen_dev(button1, "click", selectAll, false, false, false, false),
    					listen_dev(button2, "click", deselectAll, false, false, false, false),
    					listen_dev(button3, "click", downloadAll, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*url*/ 1 && input.value !== /*url*/ ctx[0]) {
    				set_input_value(input, /*url*/ ctx[0]);
    			}

    			if (dirty & /*loading*/ 4 && t19_value !== (t19_value = (/*loading*/ ctx[2] ? "Scraping..." : "Scrape Images") + "")) set_data_dev(t19, t19_value);

    			if (dirty & /*loading*/ 4) {
    				prop_dev(button0, "disabled", /*loading*/ ctx[2]);
    			}

    			if (dirty & /*url*/ 1) set_data_dev(t32, /*url*/ ctx[0]);

    			if (/*imgUrls*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div15, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div20);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t67);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t72);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t74);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t75);
    			if (detaching) detach_dev(section3);
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
    		var resultsContainer = document.getElementById("resultsContainer");
    		resultsContainer.style.display = "block";
    	}
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
    	fetch(imageSrc).then(response => response.blob()).then(blob => {
    		const url = window.URL.createObjectURL(blob);
    		const a = document.createElement("a");
    		a.href = url;
    		a.download = fileName;
    		document.body.appendChild(a);
    		a.click();
    		window.URL.revokeObjectURL(url);
    		document.body.removeChild(a);
    	}).catch(error => {
    		console.error("Error downloading image:", error);
    	});
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

    function downloadSelectedImages() {
    	const selectedImages = document.querySelectorAll(".horizontal .image-frame-vertical .frame-2 img[data-selected='true']");

    	selectedImages.forEach(image => {
    		const imageSrc = image.src;
    		const fileName = "image_" + Date.now();
    		downloadImage(imageSrc, fileName);
    	});
    }

    function downloadAll() {
    	downloadSelectedImages();
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
    	let allImgUrls = [];
    	let loading = false;
    	let error = null;

    	async function scrape() {
    		$$invalidate(2, loading = true);
    		error = null;

    		try {
    			const response = await fetch("http://localhost:5000/api/scrape", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ url })
    			});

    			const data = await response.json();

    			if (data.success) {
    				$$invalidate(1, imgUrls = data.imgUrls);
    				allImgUrls = data.imgUrls;
    			} else {
    				error = data.error;
    			}
    		} catch(error) {
    			console.error("Error:", error);
    			error = "An error occurred during the scraping process.";
    		} finally {
    			$$invalidate(2, loading = false);
    		}
    	}

    	function filterImages(imageType) {
    		if (imageType === "all") {
    			$$invalidate(1, imgUrls = allImgUrls);
    		} else {
    			$$invalidate(1, imgUrls = allImgUrls.filter(imgUrl => imgUrl.toLowerCase().endsWith(`.${imageType}`)));
    		}

    		applyFilters();
    	}

    	function countImages(imageType) {
    		return imgUrls.filter(imgUrl => imgUrl.toLowerCase().endsWith(`.${imageType}`)).length;
    	}

    	function applyFilters() {
    		const imageType = document.getElementById("imageType").value;
    		const sortOption = document.getElementById("sortOptions").value;
    		const imagesContainer = document.querySelector(".horizontal");
    		let filteredImages = allImgUrls;

    		if (imageType !== "all") {
    			filteredImages = allImgUrls.filter(imgUrl => imgUrl.toLowerCase().endsWith(`.${imageType}`));
    		}

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

    		imagesContainer.innerHTML = "";

    		// Hide the download button for non-visible images
    		filteredImages.forEach(imgUrl => {
    			const imageItem = document.createElement("div");
    			imageItem.className = "image-frame-vertical";
    			imageItem.dataset.selected = "false";
    			imageItem.innerHTML = ``;
    			imagesContainer.appendChild(imageItem);
    		});

    		// Add click event listener to toggle selection
    		imagesContainer.querySelectorAll(".image-frame-vertical img").forEach(image => {
    			image.addEventListener("click", () => {
    				toggleSelection(image);
    			});
    		});
    	}

    	// Initialize the component by scraping on mount
    	onMount(() => {
    		scrape();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		url = this.value;
    		$$invalidate(0, url);
    	}

    	const click_handler = imgUrl => downloadImage(imgUrl, "image.jpg");

    	$$self.$capture_state = () => ({
    		onMount,
    		url,
    		imgUrls,
    		allImgUrls,
    		loading,
    		error,
    		scrape,
    		filterImages,
    		countImages,
    		showResults,
    		applyFilters,
    		sortImagesBySize,
    		sortImagesByFileSize,
    		sortImagesByDimension,
    		sortImagesByName,
    		downloadImage,
    		selectAll,
    		deselectAll,
    		downloadSelectedImages,
    		downloadAll,
    		copyImageUrl,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('imgUrls' in $$props) $$invalidate(1, imgUrls = $$props.imgUrls);
    		if ('allImgUrls' in $$props) allImgUrls = $$props.allImgUrls;
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    		if ('error' in $$props) error = $$props.error;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, imgUrls, loading, scrape, input_input_handler, click_handler];
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
