var I = Object.assign;
(function() {
  "use strict";
  if (typeof window != "object") return;
  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    "isIntersecting" in window.IntersectionObserverEntry.prototype || Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", {
      get: function() {
        return this.intersectionRatio > 0
      }
    });
    return
  }

  function n(d) {
    try {
      return d.defaultView && d.defaultView.frameElement || null
    } catch (c) {
      return null
    }
  }
  var e = function(d) {
      for (var c = d, u = n(c); u;) c = u.ownerDocument, u = n(c);
      return c
    }(window.document),
    t = [],
    s = null,
    o = null;

  function i(d) {
    this.time = d.time, this.target = d.target, this.rootBounds = y(d.rootBounds), this.boundingClientRect = y(d.boundingClientRect), this.intersectionRect = y(d.intersectionRect || p()), this.isIntersecting = !!d.intersectionRect;
    var c = this.boundingClientRect,
      u = c.width * c.height,
      A = this.intersectionRect,
      w = A.width * A.height;
    u ? this.intersectionRatio = Number((w / u).toFixed(4)) : this.intersectionRatio = this.isIntersecting ? 1 : 0
  }

  function a(d, c) {
    var u = c || {};
    if (typeof d != "function") throw new Error("callback must be a function");
    if (u.root && u.root.nodeType != 1 && u.root.nodeType != 9) throw new Error("root must be a Document or Element");
    this._checkForIntersections = D(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT), this._callback = d, this._observationTargets = [], this._queuedEntries = [], this._rootMarginValues = this._parseRootMargin(u.rootMargin), this.thresholds = this._initThresholds(u.threshold), this.root = u.root || null, this.rootMargin = this._rootMarginValues.map(function(A) {
      return A.value + A.unit
    }).join(" "), this._monitoringDocuments = [], this._monitoringUnsubscribes = []
  }
  a.prototype.THROTTLE_TIMEOUT = 100, a.prototype.POLL_INTERVAL = null, a.prototype.USE_MUTATION_OBSERVER = !0, a._setupCrossOriginUpdater = function() {
    return s || (s = function(d, c) {
      !d || !c ? o = p() : o = v(d, c), t.forEach(function(u) {
        u._checkForIntersections()
      })
    }), s
  }, a._resetCrossOriginUpdater = function() {
    s = null, o = null
  }, a.prototype.observe = function(d) {
    var c = this._observationTargets.some(function(u) {
      return u.element == d
    });
    if (!c) {
      if (!(d && d.nodeType == 1)) throw new Error("target must be an Element");
      this._registerInstance(), this._observationTargets.push({
        element: d,
        entry: null
      }), this._monitorIntersections(d.ownerDocument), this._checkForIntersections()
    }
  }, a.prototype.unobserve = function(d) {
    this._observationTargets = this._observationTargets.filter(function(c) {
      return c.element != d
    }), this._unmonitorIntersections(d.ownerDocument), this._observationTargets.length == 0 && this._unregisterInstance()
  }, a.prototype.disconnect = function() {
    this._observationTargets = [], this._unmonitorAllIntersections(), this._unregisterInstance()
  }, a.prototype.takeRecords = function() {
    var d = this._queuedEntries.slice();
    return this._queuedEntries = [], d
  }, a.prototype._initThresholds = function(d) {
    var c = d || [0];
    return Array.isArray(c) || (c = [c]), c.sort().filter(function(u, A, w) {
      if (typeof u != "number" || isNaN(u) || u < 0 || u > 1) throw new Error("threshold must be a number between 0 and 1 inclusively");
      return u !== w[A - 1]
    })
  }, a.prototype._parseRootMargin = function(d) {
    var c = d || "0px",
      u = c.split(/\s+/).map(function(A) {
        var w = /^(-?\d*\.?\d+)(px|%)$/.exec(A);
        if (!w) throw new Error("rootMargin must be specified in pixels or percent");
        return {
          value: parseFloat(w[1]),
          unit: w[2]
        }
      });
    return u[1] = u[1] || u[0], u[2] = u[2] || u[0], u[3] = u[3] || u[1], u
  }, a.prototype._monitorIntersections = function(d) {
    var c = d.defaultView;
    if (!!c && this._monitoringDocuments.indexOf(d) == -1) {
      var u = this._checkForIntersections,
        A = null,
        w = null;
      this.POLL_INTERVAL ? A = c.setInterval(u, this.POLL_INTERVAL) : (b(c, "resize", u, !0), b(d, "scroll", u, !0), this.USE_MUTATION_OBSERVER && "MutationObserver" in c && (w = new c.MutationObserver(u), w.observe(d, {
        attributes: !0,
        childList: !0,
        characterData: !0,
        subtree: !0
      }))), this._monitoringDocuments.push(d), this._monitoringUnsubscribes.push(function() {
        var S = d.defaultView;
        S && (A && S.clearInterval(A), r(S, "resize", u, !0)), r(d, "scroll", u, !0), w && w.disconnect()
      });
      var k = this.root && (this.root.ownerDocument || this.root) || e;
      if (d != k) {
        var L = n(d);
        L && this._monitorIntersections(L.ownerDocument)
      }
    }
  }, a.prototype._unmonitorIntersections = function(d) {
    var c = this._monitoringDocuments.indexOf(d);
    if (c != -1) {
      var u = this.root && (this.root.ownerDocument || this.root) || e,
        A = this._observationTargets.some(function(L) {
          var S = L.element.ownerDocument;
          if (S == d) return !0;
          for (; S && S != u;) {
            var P = n(S);
            if (S = P && P.ownerDocument, S == d) return !0
          }
          return !1
        });
      if (!A) {
        var w = this._monitoringUnsubscribes[c];
        if (this._monitoringDocuments.splice(c, 1), this._monitoringUnsubscribes.splice(c, 1), w(), d != u) {
          var k = n(d);
          k && this._unmonitorIntersections(k.ownerDocument)
        }
      }
    }
  }, a.prototype._unmonitorAllIntersections = function() {
    var d = this._monitoringUnsubscribes.slice(0);
    this._monitoringDocuments.length = 0, this._monitoringUnsubscribes.length = 0;
    for (var c = 0; c < d.length; c++) d[c]()
  }, a.prototype._checkForIntersections = function() {
    if (!(!this.root && s && !o)) {
      var d = this._rootIsInDom(),
        c = d ? this._getRootRect() : p();
      this._observationTargets.forEach(function(u) {
        var A = u.element,
          w = g(A),
          k = this._rootContainsTarget(A),
          L = u.entry,
          S = d && k && this._computeTargetAndRootIntersection(A, w, c),
          P = null;
        this._rootContainsTarget(A) ? (!s || this.root) && (P = c) : P = p();
        var $ = u.entry = new i({
          time: m(),
          target: A,
          boundingClientRect: w,
          rootBounds: P,
          intersectionRect: S
        });
        L ? d && k ? this._hasCrossedThreshold(L, $) && this._queuedEntries.push($) : L && L.isIntersecting && this._queuedEntries.push($) : this._queuedEntries.push($)
      }, this), this._queuedEntries.length && this._callback(this.takeRecords(), this)
    }
  }, a.prototype._computeTargetAndRootIntersection = function(d, c, u) {
    if (window.getComputedStyle(d).display != "none") {
      for (var A = c, w = M(d), k = !1; !k && w;) {
        var L = null,
          S = w.nodeType == 1 ? window.getComputedStyle(w) : {};
        if (S.display == "none") return null;
        if (w == this.root || w.nodeType == 9)
          if (k = !0, w == this.root || w == e) s && !this.root ? !o || o.width == 0 && o.height == 0 ? (w = null, L = null, A = null) : L = o : L = u;
          else {
            var P = M(w),
              $ = P && g(P),
              Me = P && this._computeTargetAndRootIntersection(P, $, u);
            $ && Me ? (w = P, L = v($, Me)) : (w = null, A = null)
          }
        else {
          var ye = w.ownerDocument;
          w != ye.body && w != ye.documentElement && S.overflow != "visible" && (L = g(w))
        }
        if (L && (A = h(L, A)), !A) break;
        w = w && M(w)
      }
      return A
    }
  }, a.prototype._getRootRect = function() {
    var d;
    if (this.root && !l(this.root)) d = g(this.root);
    else {
      var c = l(this.root) ? this.root : e,
        u = c.documentElement,
        A = c.body;
      d = {
        top: 0,
        left: 0,
        right: u.clientWidth || A.clientWidth,
        width: u.clientWidth || A.clientWidth,
        bottom: u.clientHeight || A.clientHeight,
        height: u.clientHeight || A.clientHeight
      }
    }
    return this._expandRectByRootMargin(d)
  }, a.prototype._expandRectByRootMargin = function(d) {
    var c = this._rootMarginValues.map(function(A, w) {
        return A.unit == "px" ? A.value : A.value * (w % 2 ? d.width : d.height) / 100
      }),
      u = {
        top: d.top - c[0],
        right: d.right + c[1],
        bottom: d.bottom + c[2],
        left: d.left - c[3]
      };
    return u.width = u.right - u.left, u.height = u.bottom - u.top, u
  }, a.prototype._hasCrossedThreshold = function(d, c) {
    var u = d && d.isIntersecting ? d.intersectionRatio || 0 : -1,
      A = c.isIntersecting ? c.intersectionRatio || 0 : -1;
    if (u !== A)
      for (var w = 0; w < this.thresholds.length; w++) {
        var k = this.thresholds[w];
        if (k == u || k == A || k < u != k < A) return !0
      }
  }, a.prototype._rootIsInDom = function() {
    return !this.root || x(e, this.root)
  }, a.prototype._rootContainsTarget = function(d) {
    var c = this.root && (this.root.ownerDocument || this.root) || e;
    return x(c, d) && (!this.root || c == d.ownerDocument)
  }, a.prototype._registerInstance = function() {
    t.indexOf(this) < 0 && t.push(this)
  }, a.prototype._unregisterInstance = function() {
    var d = t.indexOf(this);
    d != -1 && t.splice(d, 1)
  };

  function m() {
    return window.performance && performance.now && performance.now()
  }

  function D(d, c) {
    var u = null;
    return function() {
      u || (u = setTimeout(function() {
        d(), u = null
      }, c))
    }
  }

  function b(d, c, u, A) {
    typeof d.addEventListener == "function" ? d.addEventListener(c, u, A || !1) : typeof d.attachEvent == "function" && d.attachEvent("on" + c, u)
  }

  function r(d, c, u, A) {
    typeof d.removeEventListener == "function" ? d.removeEventListener(c, u, A || !1) : typeof d.detatchEvent == "function" && d.detatchEvent("on" + c, u)
  }

  function h(d, c) {
    var u = Math.max(d.top, c.top),
      A = Math.min(d.bottom, c.bottom),
      w = Math.max(d.left, c.left),
      k = Math.min(d.right, c.right),
      L = k - w,
      S = A - u;
    return L >= 0 && S >= 0 && {
      top: u,
      bottom: A,
      left: w,
      right: k,
      width: L,
      height: S
    } || null
  }

  function g(d) {
    var c;
    try {
      c = d.getBoundingClientRect()
    } catch (u) {}
    return c ? (c.width && c.height || (c = {
      top: c.top,
      right: c.right,
      bottom: c.bottom,
      left: c.left,
      width: c.right - c.left,
      height: c.bottom - c.top
    }), c) : p()
  }

  function p() {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    }
  }

  function y(d) {
    return !d || "x" in d ? d : {
      top: d.top,
      y: d.top,
      bottom: d.bottom,
      left: d.left,
      x: d.left,
      right: d.right,
      width: d.width,
      height: d.height
    }
  }

  function v(d, c) {
    var u = c.top - d.top,
      A = c.left - d.left;
    return {
      top: u,
      left: A,
      height: c.height,
      width: c.width,
      bottom: u + c.height,
      right: A + c.width
    }
  }

  function x(d, c) {
    for (var u = c; u;) {
      if (u == d) return !0;
      u = M(u)
    }
    return !1
  }

  function M(d) {
    var c = d.parentNode;
    return d.nodeType == 9 && d != e ? n(d) : (c && c.assignedSlot && (c = c.assignedSlot.parentNode), c && c.nodeType == 11 && c.host ? c.host : c)
  }

  function l(d) {
    return d && d.nodeType === 9
  }
  window.IntersectionObserver = a, window.IntersectionObserverEntry = i
})();

function Z(n, e) {
  let t = n.replace(/^\/|\/$/g, "").split("/"),
    s = e.replace(/^\/|\/$/g, "").split("/"),
    o = {};
  for (let i = 0; i < t.length; i++) {
    let a = t[i],
      m = s[i];
    if (a === "*") return o;
    if (i > s.length - 1) return null;
    if (a.startsWith(":")) {
      let D = a.slice(1);
      o[D] = m
    } else if (a !== m) return null
  }
  return t.length !== s.length ? null : o
}
var Ae = class {
    constructor() {
      this._events = Object.create({})
    }
    on(e, t) {
      let s = this._events[e];
      Array.isArray(s) || (s = this._events[e] = []), s.push(t)
    }
    off(e, t) {
      let s = this._events[e];
      if (!Array.isArray(s)) return;
      let o = s.lastIndexOf(t);
      o !== -1 && (s.splice(o, 1), s.length === 0 && delete this._events[e])
    }
    emit(e, ...t) {
      let s = this._events[e];
      if (Array.isArray(s))
        for (let o of s) o(...t)
    }
  },
  C = new Ae;
var j = document.getElementById("dashboard"),
  we = document.getElementById("wallpaper"),
  J = document.getElementById("content"),
  U = 1,
  H = U,
  F = {};

function se() {
  return {
    x: pageXOffset,
    y: pageYOffset
  }
}
async function _e(n) {
  let e = await fetch(n.pathname + "?content"),
    {
      title: t,
      description: s,
      content: o
    } = await e.json();
  return {
    title: t,
    description: s,
    content: o
  }
}

function Ee({
  title: n,
  description: e,
  content: t
}) {
  document.title = n, document.querySelector('meta[name="description"]').setAttribute("content", e), J.innerHTML = t, document.activeElement instanceof HTMLElement && document.activeElement.blur()
}

function Ot(n) {
  let e = document.createElement("link");
  e.rel = "prefetch", e.href = n.href + "?content", e.as = "fetch", document.head.appendChild(e)
}
var ke = n => {
    let e = Le(n.target);
    if (e && e.href) {
      let t = new URL(e.href);
      ["/", "/about", "/team", "/careers", "/careers/:job", "/work", "/work/:project", "/legal-notice", "/privacy-policy"].some(s => !!Z(s, t.pathname)) && Ot(t)
    }
  },
  Se = 0,
  Nt = n => {
    clearTimeout(Se), Se = setTimeout(() => {
      ke(n)
    }, 20)
  };
addEventListener("touchstart", ke);
addEventListener("mousemove", Nt);

function re(n, e) {
  let t = new Map(n.map(i => [i, new Set])),
    s, o;
  return Promise.race([new Promise(i => setTimeout(() => i(), e)), new Promise(i => {
    s = a => {
      if (a.target) {
        let m = t.get(a.target);
        m && m.add(a.propertyName)
      }
    }, o = a => {
      if (a.target) {
        let D = t.get(a.target);
        D && D.delete(a.propertyName)
      }
      let m = 0;
      for (let [, D] of t) m += D.size;
      m === 0 && i()
    };
    for (let a of n) a.addEventListener("transitionstart", s), a.addEventListener("transitionend", o), a.addEventListener("transitioncancel", o)
  })]).then(() => {
    for (let i of n) i.removeEventListener("transitionstart", s), i.removeEventListener("transitionend", o), i.removeEventListener("transitioncancel", o)
  })
}
var B = Promise.resolve(),
  Ut = [{
    pattern: "/",
    transitions: [{
      pattern: "*",
      async transition(n, e, t) {
        B = B.then(() => new Promise(s => {
          let o = window.scrollY;
          _e(e).then(i => {
            Ee(i)
          }), document.body.classList.remove("dashboard--enter", "dashboard--enter-active", "dashboard--enter-done"), document.body.classList.add("dashboard--exit"), requestAnimationFrame(() => {
            document.body.classList.remove("dashboard--exit"), document.body.classList.add("dashboard--exit-active"), j.scrollTo(0, o), we.style.top = `${o}px`, j.transitionOut(), re([j, J], 1e3).then(() => {
              document.body.classList.remove("dashboard--exit-active"), document.body.classList.add("dashboard--exit-done"), we.style.removeProperty("top"), requestAnimationFrame(() => s())
            })
          })
        }))
      }
    }]
  }, {
    pattern: "*",
    transitions: [{
      pattern: "/",
      async transition(n, e, t) {
        B = B.then(() => new Promise(s => {
          document.body.classList.remove("dashboard--exit", "dashboard--exit-active", "dashboard--exit-done"), document.body.classList.add("dashboard--enter"), requestAnimationFrame(() => {
            document.body.classList.remove("dashboard--enter"), document.body.classList.add("dashboard--enter-active"), window.scrollTo(0, 0), j.transitionIn(), re([j, J], 1e3).then(() => {
              document.body.classList.remove("dashboard--enter-active"), document.body.classList.add("dashboard--enter-done"), requestAnimationFrame(() => s())
            })
          })
        }))
      }
    }]
  }, {
    pattern: "/team",
    transitions: [{
      pattern: "/team/:handle",
      async transition(n, e, t) {
        C.emit("team-modal.open", t.handle)
      }
    }]
  }, {
    pattern: "/team/:handle",
    transitions: [{
      pattern: "/team/:handle",
      async transition(n, e, t) {
        C.emit("team-modal.open", t.handle)
      }
    }]
  }, {
    pattern: "/team/:handle",
    transitions: [{
      pattern: "/team",
      async transition(n, e, t) {
        C.emit("team-modal.close")
      }
    }]
  }, {
    pattern: "*",
    transitions: [{
      pattern: "*",
      async transition(n, e) {
        B = B.then(() => new Promise(t => {
          _e(e).then(s => {
            document.body.classList.add("content--enter"), Ee(s), requestAnimationFrame(() => {
              document.body.classList.remove("content--enter"), document.body.classList.add("content--enter-active"), re([J], 1e3).then(() => {
                document.body.classList.remove("content--enter-active"), requestAnimationFrame(() => t())
              })
            })
          })
        }))
      }
    }]
  }];
async function Te(n, e, t, s, o) {
  let i = !!t;
  if (i) H = t;
  else {
    let a = se();
    F[H] = a, H = t = ++U, F[H] = s ? a : {
      x: 0,
      y: 0
    }
  }
  e: for (let {
      pattern: a,
      transitions: m
    } of Ut)
    if (Z(a, n.pathname))
      for (let {
          pattern: D,
          transition: b
        } of m) {
        let r = Z(D, e.pathname);
        if (r) {
          await b(n, e, r);
          break e
        }
      }
  if (!s) {
    let a = F[t],
      m;
    o && (m = document.getElementById(o.slice(1)), m && (a = {
      x: 0,
      y: m.getBoundingClientRect().top + scrollY
    })), F[H] = a, i || m ? scrollTo(a.x, a.y) : scrollTo(0, 0)
  }
  C.emit("router.url-changed")
}

function Le(n) {
  for (; n && n.nodeName.toUpperCase() !== "A";) n = n.parentNode;
  return n
}

function Ft(n) {
  return n.which === null ? n.button : n.which
}
var Q = new URL(location.href);
history.replaceState({
  id: U
}, "", location.href);
F[U] = se();
addEventListener("popstate", n => {
  F[H] = se(), n.state ? Q.href !== location.href && (Te(Q, new URL(location.href), n.state.id), Q = new URL(location.href)) : (U += 1, H = U, history.replaceState({
    id: H
  }, "", location.href))
});
addEventListener("click", n => {
  if (Ft(n) !== 1 || n.metaKey || n.ctrlKey || n.shiftKey || n.altKey || n.defaultPrevented) return;
  let e = Le(n.target);
  if (!e || !e.href) return;
  let t = typeof e.href == "object" && e.href.constructor.name === "SVGAnimatedString",
    s = String(t ? e.href.baseVal : e.href);
  if (s === location.href) {
    location.hash || n.preventDefault();
    return
  }
  if (e.hasAttribute("download") || e.getAttribute("rel") === "external" || (t ? e.target.baseVal : e.target)) return;
  let o = new URL(s);
  if (o.pathname === location.pathname && o.search === location.search || o.origin !== location.origin) return;
  n.preventDefault();
  let i = e.hasAttribute("data-noscroll");
  Te(new URL(location.href), o, null, i, o.hash), history.pushState({
    id: H
  }, "", o.href), Q = new URL(location.href)
});
var z = matchMedia("(min-width: 768px)");
var oe = 0;

function ae(n) {
  n >= oe && (oe = n + 1)
}

function Ce(n) {
  return n.composedPath().some(e => e instanceof HTMLElement && e.hasAttribute("data-nodrag"))
}
var ee = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.dragging = !1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startOffsetX = 0;
    this.startOffsetY = 0;
    this.startClientX = 0;
    this.startClientY = 0;
    this.touchTimeout = 0;
    this.preventClickDuringDrag = e => {
      this.dragging && e.preventDefault()
    };
    this.mouseDown = e => {
      this.bringToFront(), !Ce(e) && (e.preventDefault(), addEventListener("mousemove", this.mouseMove), addEventListener("mouseup", this.mouseUp), this.dragStart(e))
    };
    this.mouseMove = e => {
      e.preventDefault(), this.dragMove(e)
    };
    this.mouseUp = () => {
      removeEventListener("mousemove", this.mouseMove), removeEventListener("mouseup", this.mouseUp), this.dragEnd()
    };
    this.touchStart = e => {
      if (this.bringToFront(), !Ce(e))
        if (z.matches) {
          for (let t of e.composedPath()) {
            if (t === this) break;
            if (t instanceof HTMLElement && t.scrollHeight > t.offsetHeight) {
              let s = getComputedStyle(t);
              if (!(s.overflow === "hidden" || s.overflowX === "hidden" || s.overflowY === "hidden")) return
            }
          }
          addEventListener("touchmove", this.touchMove, {
            passive: !1
          }), addEventListener("touchend", this.touchEnd), this.dragStart(e.touches[0])
        } else this.touchTimeout = setTimeout(() => {
          removeEventListener("scroll", this.touchEnd, {
            capture: !0
          }), addEventListener("touchmove", this.touchMove, {
            passive: !1
          }), this.dragStart(e.touches[0])
        }, 500), addEventListener("scroll", this.touchEnd, {
          capture: !0
        }), addEventListener("touchend", this.touchEnd)
    };
    this.touchMove = e => {
      e.preventDefault(), z.matches || e.preventDefault(), this.dragMove(e.touches[0])
    };
    this.touchEnd = () => {
      clearTimeout(this.touchTimeout), removeEventListener("scroll", this.touchEnd, {
        capture: !0
      }), removeEventListener("touchmove", this.touchMove), removeEventListener("touchend", this.touchEnd), this.dragEnd()
    }
  }
  connectedCallback() {
    ae(Number(this.style.zIndex)), this.addEventListener("click", this.preventClickDuringDrag, {
      capture: !0
    }), this.addEventListener("mousedown", this.mouseDown), this.addEventListener("touchstart", this.touchStart)
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.preventClickDuringDrag, {
      capture: !0
    }), this.removeEventListener("mousedown", this.mouseDown), this.removeEventListener("touchstart", this.touchStart), removeEventListener("mousemove", this.mouseMove), removeEventListener("mouseup", this.mouseUp), removeEventListener("touchmove", this.touchMove), removeEventListener("touchend", this.touchEnd)
  }
  bringToFront() {
    this.style.zIndex = String(oe++)
  }
  dragStart({
    clientX: e,
    clientY: t
  }) {
    this.bringToFront(), document.documentElement.style.userSelect = "none", document.documentElement.style.webkitUserSelect = "none", this.style.touchAction = "none", this.startOffsetX = this.offsetX, this.startOffsetY = this.offsetY, this.startClientX = e, this.startClientY = t
  }
  dragMove({
    clientX: e,
    clientY: t
  }) {
    Math.abs(e - this.startClientX) + Math.abs(t - this.startClientY) >= 4 && (this.dragging = !0), this.offsetX = this.startOffsetX + e - this.startClientX, this.offsetY = this.startOffsetY + t - this.startClientY, this.style.setProperty("--x", `${this.offsetX}px`), this.style.setProperty("--y", `${this.offsetY}px`)
  }
  dragEnd() {
    document.documentElement.style.removeProperty("user-select"), document.documentElement.style.removeProperty("-webkit-user-select"), this.style.removeProperty("touch-action"), requestAnimationFrame(() => {
      this.dragging = !1
    })
  }
};
customElements.define("draggable-element", ee);
var Pe = class extends HTMLElement {
  constructor() {
    super();
    this.showFront = this.showFront.bind(this), this.showBack = this.showBack.bind(this)
  }
  connectedCallback() {
    for (let e of ["mouseenter", "touchstart"]) this.addEventListener(e, this.showBack);
    for (let e of ["mouseleave", "touchend"]) this.addEventListener(e, this.showFront)
  }
  disconnectedCallback() {
    for (let e of ["mouseenter", "touchstart"]) this.removeEventListener(e, this.showBack);
    for (let e of ["mouseleave", "touchend"]) this.removeEventListener(e, this.showFront)
  }
  showFront() {
    this.removeAttribute("flipped")
  }
  showBack() {
    this.setAttribute("flipped", "")
  }
};
customElements.define("flip-card", Pe);
var Ie = class extends HTMLElement {
  constructor() {
    super();
    this.handleMouseDown = this.handleMouseDown.bind(this)
  }
  connectedCallback() {
    this.addEventListener("mousedown", this.handleMouseDown)
  }
  disconnectedCallback() {
    this.removeEventListener("mousedown", this.handleMouseDown)
  }
  handleMouseDown(e) {
    let t, s = e.clientX,
      o = this.scrollLeft;
    this.setAttribute("dragging", "");
    let i = m => {
        m.preventDefault();
        let D = m.clientX - s,
          b = o - D;
        t && cancelAnimationFrame(t), t = requestAnimationFrame(() => {
          this.scrollTo(b, 0), t = null
        })
      },
      a = m => {
        this.removeAttribute("dragging"), window.removeEventListener("mousemove", i, {
          capture: !0
        }), window.removeEventListener("mouseup", a)
      };
    window.addEventListener("mousemove", i, {
      capture: !0
    }), window.addEventListener("mouseup", a)
  }
};
customElements.define("mad-slider", Ie);
var He = document.createElement("template");
He.innerHTML = `
	<style>
		* { box-sizing: border-box; }
		button {
			display: block;
			width: 62px;
			height: 42px;
			margin: 0;
			padding: 6px;
			background: transparent;
			-webkit-appearance: none;
			-moz-appearance: none;
			border: none;
			outline: 0;
			cursor: pointer;
		}
		.outer {
			width: 50px;
			height: 30px;
			padding: 2px;
			border-radius: 15px;
			transition: background-color 300ms ease;
			background-color: #e8e9eb;
		}
		:host([on]) .outer {
			background-color: #35c759;
		}
		.inner {
			width: 26px;
			height: 26px;
			border-radius: 13px;
			background-color: #fff;
			box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.01), 0px 3px 1px rgba(0, 0, 0, 0.03);
			transition: transform 300ms ease;
		}
		:host([on]) .inner {
			transform: translate3d(20px, 0px, 0px);
		}
	</style>
	<button>
		<div class="outer">
			<div class="inner"></div>
		</div>
	</button>
`;
var le = !1;
addEventListener("mousedown", () => {
  le = !0
});
addEventListener("mouseup", () => {
  le = !1
});
var Re = null;
addEventListener("touchmove", n => {
  let e = document.elementFromPoint(n.touches[0].clientX, n.touches[0].clientY);
  e instanceof ce && (n.preventDefault(), e !== Re && (e.toggle(), Re = e))
});
var ce = class extends HTMLElement {
  constructor() {
    super();
    this.handleClick = () => {
      this.toggle()
    };
    this.handleMouseEnter = () => {
      le && this.toggle()
    };
    this.handleTouchMove = e => {
      e.preventDefault()
    };
    this.attachShadow({
      mode: "open"
    }), this.shadowRoot.appendChild(He.content.cloneNode(!0))
  }
  connectedCallback() {
    this.addEventListener("click", this.handleClick), this.addEventListener("mouseenter", this.handleMouseEnter), this.addEventListener("touchmove", this.handleTouchMove)
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick), this.removeEventListener("mouseenter", this.handleMouseEnter), this.removeEventListener("touchmove", this.handleTouchMove)
  }
  toggle() {
    this.hasAttribute("on") ? this.removeAttribute("on") : this.setAttribute("on", "")
  }
};
customElements.define("mad-switch", ce);

function $e(n, e, t) {
  var s = null;
  return function() {
    if (!e) return n.apply(this, arguments);
    var o = this,
      i = arguments,
      a = t && !s;
    if (clearTimeout(s), s = setTimeout(function() {
        if (s = null, !a) return n.apply(o, i)
      }, e), a) return n.apply(this, arguments)
  }
}

function q(n) {
  let e = null;
  return function(...t) {
    e !== null && (cancelAnimationFrame(e), e = null), requestAnimationFrame(() => n(...t))
  }
}

function Oe(n) {
  return new Array(n).fill(0).map((e, t) => t)
}
var de = ["                                                             ", "                                                             ", "          xxxx        xxxxxxxxxxxxxxx            xxxx        ", "         xxxxx        xxxxxxxxxxxxxxx           xxxxx        ", "        xxxxx         xxxxx      xxxx          xxxxx         ", "       xxxxx          xxxxx      xxxx         xxxxx          ", "      xxxxx           xxxxx      xxxx        xxxxx           ", "     xxxxx    xxxx    xxxxx      xxxx       xxxxx    xxxx    ", "    xxxxx    xxxxx    xxxxx      xxxx      xxxxx    xxxxx    ", "   xxxxxxxxxxxxxxx    xxxxx      xxxx     xxxxxxxxxxxxxxx    ", "   xxxxxxxxxxxxxxxx   xxxxx      xxxx     xxxxxxxxxxxxxxxx   ", "   xxxxxxxxxxxxxxxx   xxxxxxxxxxxxxxx     xxxxxxxxxxxxxxxx   ", "            xxxx      xxxxxxxxxxxxxxx              xxxx      ", "            xxxx                                   xxxx      ", "                                                             ", "                                                             "],
  Bt = de[0].length,
  zt = de.length,
  Wt = 62,
  jt = 42,
  Ne = class extends HTMLElement {
    constructor() {
      super();
      this.render = () => {
        let e = window.innerWidth,
          t = window.innerHeight,
          s = Math.floor(e / Wt),
          o = Math.floor(t / jt);
        this.innerHTML = Oe(o).map(i => `<div>${Oe(s).map(a=>de[Math.floor(i/o*zt)][Math.floor(a/s*Bt)]==="x"?"<mad-switch on></mad-switch>":"<mad-switch></mad-switch>").join(`
`)}</div>`).join(`
`)
      };
      this.debouncedRender = $e(this.render, 100)
    }
    connectedCallback() {
      addEventListener("resize", this.debouncedRender), this.render()
    }
    disconnectedCallback() {
      removeEventListener("resize", this.debouncedRender)
    }
  };
customElements.define("mad-notfound", Ne);
var E = devicePixelRatio > 1 ? 2 : 1;

function qt(n, e) {
  let t = Math.log2(e.k / n.tileSize),
    s = Math.round(Math.max(t, 0)),
    o = Math.pow(2, t - s) * n.tileSize,
    i = e.x - e.k / 2,
    a = e.y - e.k / 2,
    m = Math.max(0, Math.floor((n.x0 - i) / o)),
    D = Math.min(1 << s, Math.ceil((n.x1 - i) / o)),
    b = Math.max(0, Math.floor((n.y0 - a) / o)),
    r = Math.min(1 << s, Math.ceil((n.y1 - a) / o)),
    h = [];
  for (let g = m; g < D; g++)
    for (let p = b; p < r; p++) h.push([g, p, s]);
  return {
    tiles: h,
    translate: [i / o, a / o],
    scale: o
  }
}

function Ue(n, e, t) {
  return [n, e, t].join(".")
}
var Fe = class extends HTMLElement {
  constructor() {
    super();
    this.startOffsetX = 0;
    this.startOffsetY = 0;
    this.startX = 0;
    this.startY = 0;
    this.render = q(() => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let e = qt(this.viewport, this.transform);
      for (let [m, D, b] of e.tiles) {
        let r = Ue(m, D, b);
        if (!this.cache[r]) {
          let h = new Image;
          h.src = `/mapbox/styles/v1/mapbox/streets-v11/tiles/${this.viewport.tileSize}/${b}/${m}/${D}${E===2?"@2x":""}`, h.onload = () => {
            this.cache[r].ready = !0, this.render()
          }, this.cache[r] = {
            image: h,
            ready: !1
          }
        }
        if (this.cache[r].ready) this.context.drawImage(this.cache[r].image, 0, 0, this.viewport.tileSize * E, this.viewport.tileSize * E, (m + e.translate[0]) * e.scale * E, (D + e.translate[1]) * e.scale * E, e.scale * E, e.scale * E);
        else {
          let h = m,
            g = D,
            p = b,
            y = 0,
            v = 0,
            x = this.viewport.tileSize * E,
            M = r;
          for (; p >= 0;)
            if (p -= 1, h = Math.floor(m / 2), g = Math.floor(D / 2), y = y / 2 + (m / 2 - h) * this.viewport.tileSize * E, v = v / 2 + (D / 2 - g) * this.viewport.tileSize * E, x = x / 2, M = Ue(h, g, p), this.cache[M] && this.cache[M].ready) {
              this.context.drawImage(this.cache[M].image, y, v, x, x, (m + e.translate[0]) * e.scale * E, (D + e.translate[1]) * e.scale * E, e.scale * E, e.scale * E);
              break
            }
        }
      }
      let t = 52.534391,
        s = 13.406091,
        o = Math.round(Math.max(Math.log2(this.transform.k / this.viewport.tileSize), 0)),
        i = (s + 180) / 360 * Math.pow(2, o),
        a = (1 - Math.log(Math.tan(t * Math.PI / 180) + 1 / Math.cos(t * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, o);
      for (let [m, D] of e.tiles)
        if (Math.floor(i) === m && Math.floor(a) === D) {
          let b = (i + e.translate[0]) * e.scale * E,
            r = (a + e.translate[1]) * e.scale * E;
          this.context.fillStyle = "rgba(24, 133, 252, 0.15)", this.context.beginPath(), this.context.arc(b, r, 22 * E, 0, 2 * Math.PI), this.context.fill(), this.context.fillStyle = "rgb(255, 255, 255)", this.context.beginPath(), this.context.arc(b, r, 11 * E, 0, 2 * Math.PI), this.context.fill(), this.context.fillStyle = "rgb(24, 133, 252)", this.context.beginPath(), this.context.arc(b, r, 8 * E, 0, 2 * Math.PI), this.context.fill();
          break
        }
    });
    this.mousedown = e => {
      e.preventDefault(), this.panStart(e), addEventListener("mousemove", this.mousemove, {
        capture: !0
      }), addEventListener("mouseup", this.mouseup)
    };
    this.mousemove = e => {
      e.stopPropagation(), this.panMove(e)
    };
    this.mouseup = () => {
      removeEventListener("mousemove", this.mousemove, {
        capture: !0
      }), removeEventListener("mouseup", this.mouseup)
    };
    this.touchstart = e => {
      e.preventDefault(), e.stopPropagation(), this.panStart(e.touches[0]), addEventListener("touchmove", this.touchmove), addEventListener("touchend", this.touchend)
    };
    this.touchmove = e => {
      this.panMove(e.touches[0])
    };
    this.touchend = () => {
      removeEventListener("touchmove", this.touchmove), removeEventListener("touchend", this.touchend)
    };
    this.panStart = ({
      clientX: e,
      clientY: t
    }) => {
      this.startX = this.transform.x, this.startY = this.transform.y, this.startOffsetX = e, this.startOffsetY = t
    };
    this.panMove = ({
      clientX: e,
      clientY: t
    }) => {
      let s = this.startOffsetX - e,
        o = this.startOffsetY - t;
      this.transform.x = this.startX - s, this.transform.y = this.startY - o, this.render()
    };
    this.wheel = e => {
      e.preventDefault();
      let t = this.canvas.getBoundingClientRect(),
        s = e.clientX - t.left,
        o = e.clientY - t.top,
        i = this.transform.k,
        a = this.transform.x,
        m = this.transform.y,
        D = [s, o],
        b = [(s - a) / i, (o - m) / i],
        r = Math.max(Math.max(t.width, t.height), Math.min(1e8, i * Math.pow(2, e.deltaY * (e.deltaMode === 1 ? .05 : e.deltaMode ? 1 : .002) * (e.ctrlKey ? 10 : 1)))),
        h = D[0] - b[0] * r,
        g = D[1] - b[1] * r;
      this.transform.k = r, this.transform.x = h, this.transform.y = g, this.render()
    };
    this.cache = {}, this.viewport = {
      x0: 0,
      y0: 0,
      x1: 512,
      y1: 512,
      tileSize: 256
    }, this.transform = {
      k: 11270123585033266e-9,
      x: -419506.0200756529,
      y: 1.9398545909057977e6
    }
  }
  connectedCallback() {
    this.canvas = document.createElement("canvas"), this.canvas.style.width = `${this.viewport.x1-this.viewport.x0}px`, this.canvas.style.height = `${this.viewport.y1-this.viewport.y0}px`, this.canvas.width = (this.viewport.x1 - this.viewport.x0) * E, this.canvas.height = (this.viewport.y1 - this.viewport.y0) * E, this.context = this.canvas.getContext("2d"), this.appendChild(this.canvas);
    let e = new IntersectionObserver(([t]) => {
      t.isIntersecting && (e.disconnect(), setTimeout(() => {
        this.render()
      }))
    });
    e.observe(this), this.addEventListener("mousedown", this.mousedown, {
      capture: !0
    }), this.addEventListener("touchstart", this.touchstart, {
      capture: !0
    }), this.addEventListener("wheel", this.wheel)
  }
  disconnectedCallback() {
    this.removeEventListener("mousedown", this.mousedown, {
      capture: !0
    }), this.removeEventListener("touchstart", this.touchstart, {
      capture: !0
    }), this.removeEventListener("wheel", this.wheel)
  }
};
customElements.define("mad-map", Fe);

function Be(n, e) {
  let t = new Date,
    s = t.getMinutes(),
    o = s / 60 * 360,
    a = (t.getHours() + s / 60) / 12 * 360;
  e.style.transform = `rotate(${o}deg)`, n.style.transform = `rotate(${a}deg)`
}
var ze = class extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    let e = this.querySelector(".mad-clock__hour"),
      t = this.querySelector(".mad-clock__minute");
    t.style.transformOrigin = "50% 50%", e.style.transformOrigin = "50% 50%", Be(e, t), this.timer = setInterval(() => Be(e, t), 1e3 * 15)
  }
  disconnectedCallback() {
    clearInterval(this.timer)
  }
};
customElements.define("mad-clock", ze);

function Vt(n) {
  return n === " "
}

function We(n) {
  return "0" <= n && n <= "9"
}

function Yt(n) {
  return n === n.toLowerCase()
}

function Xt(n) {
  let e = 0,
    t = 0,
    s = 0,
    o = 0,
    i = 0,
    a = 0,
    m = 0,
    D = [];
  for (; e < n.length;) {
    b();
    let g = n[e++],
      p = Yt(g);
    switch (b(), g) {
      case "m":
      case "M":
        D.push([]);
      case "l":
      case "L": {
        t = h() + (p ? t : 0), r(), s = h() + (p ? s : 0), D[D.length - 1].push({
          type: g.toUpperCase(),
          x: t,
          y: s,
          circles: [],
          lines: []
        });
        break
      }
      case "c":
      case "C": {
        o = h() + (p ? t : 0), r(), i = h() + (p ? s : 0), r(), a = h() + (p ? t : 0), r(), m = h() + (p ? s : 0), r(), t = h() + (p ? t : 0), r(), s = h() + (p ? s : 0), D[D.length - 1].push({
          type: g.toUpperCase(),
          x1: o,
          y1: i,
          x2: a,
          y2: m,
          x: t,
          y: s,
          circles: [],
          lines: []
        });
        break
      }
    }
  }
  for (let g = 0; g < D.length; g++)
    for (let p = 0; p < D[g].length; p++) D[g][p].prev = D[g][((p - 1) % D[g].length + D[g].length) % D[g].length], D[g][p].next = D[g][((p + 1) % D[g].length + D[g].length) % D[g].length];
  return D;

  function b() {
    for (; Vt(n[e]);) e++
  }

  function r() {
    b(), n[e] === "," && (e++, b())
  }

  function h() {
    let g = e;
    for (n[e] === "-" && e++; We(n[e]);) e++;
    if (n[e] === ".")
      for (e++; We(n[e]);) e++;
    return Number(n.substring(g, e))
  }
}
var je = class extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    let e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    e.setAttribute("width", "320"), e.setAttribute("height", "280");
    let t = ["M128.175 236.471L147.439 245L153.814 154.866L127.97 143.423L65 208.499L83.6654 216.763L97.3387 202.234L129.883 216.644L128.175 236.471ZM109.52 189.435L134.401 163.002L131.416 199.129L109.52 189.435Z", "M164.36 26L149.991 30.0975L144.11 77.4604L143.864 77.5305L113.638 40.4639L99.2693 44.5614L100.823 132.461L120.719 126.788L118.835 76.4645L119.081 76.3944L145.112 107.211L158.745 103.324L164.522 63.4365L164.768 63.3665L189.986 107.035L209.759 101.397L164.36 26Z", "M172.118 215.196L218.794 218.442L233.02 205.689C242.685 196.997 251.807 188.876 252.913 173.143C254.394 152.086 236.764 134.564 212.612 132.884L178.074 130.483L172.118 215.196ZM190.523 199.45L194.097 148.622L207.911 149.583C222.942 150.874 232.079 161.946 231.066 176.363C230.026 191.147 219.385 201.458 205.448 200.488L190.523 199.45Z"];
    for (let s of t) {
      let o = Xt(s),
        i = document.createElementNS("http://www.w3.org/2000/svg", "path"),
        a = document.createElementNS("http://www.w3.org/2000/svg", "g");
      a.setAttribute("data-group", "");
      let m = document.createElementNS("http://www.w3.org/2000/svg", "g");
      m.setAttribute("data-controls", "");
      let D = "";
      for (let b of o)
        for (let r of b) {
          if (r.type === "M") {
            D += `M${r.x},${r.y}`; {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              h.setAttribute("cx", String(r.x)), h.setAttribute("cy", String(r.y)), h.setAttribute("r", String(4)), h.setAttribute("fill", "#f5f5f5"), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.circles.push(h), h.addEventListener("mousedown", g => {
                g.stopImmediatePropagation();
                let p = v => {
                    v.stopImmediatePropagation();
                    let x = e.getBoundingClientRect(),
                      M = v.clientX - x.left,
                      l = v.clientY - x.top;
                    h.setAttribute("cx", String(M)), h.setAttribute("cy", String(l)), r.x = M, r.y = l;
                    let d = r.next;
                    d && d.type === "C" && (d.lines[0].setAttribute("x1", String(M)), d.lines[0].setAttribute("y1", String(l))), i.setAttribute("d", o.map(c => c.map(u => {
                      if (u.type === "M") return `M${u.x},${u.y}`;
                      if (u.type === "L") return `L${u.x},${u.y}`;
                      if (u.type === "C") return `C${u.x1},${u.y1} ${u.x2},${u.y2} ${u.x},${u.y}`
                    }).join(" ")).join(" "))
                  },
                  y = v => {
                    v.stopImmediatePropagation(), removeEventListener("mousemove", p), removeEventListener("mouseup", y)
                  };
                addEventListener("mousemove", p), addEventListener("mouseup", y)
              })
            }
          }
          if (r.type === "L") {
            D += `L${r.x},${r.y}`; {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              h.setAttribute("cx", String(r.x)), h.setAttribute("cy", String(r.y)), h.setAttribute("r", String(4)), h.setAttribute("fill", "#f5f5f5"), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.circles.push(h), h.addEventListener("mousedown", g => {
                g.stopImmediatePropagation();
                let p = v => {
                    v.stopImmediatePropagation();
                    let x = e.getBoundingClientRect(),
                      M = v.clientX - x.left,
                      l = v.clientY - x.top;
                    h.setAttribute("cx", String(M)), h.setAttribute("cy", String(l)), r.x = M, r.y = l;
                    let d = r.next;
                    d && d.type === "C" && (d.lines[0].setAttribute("x1", String(M)), d.lines[0].setAttribute("y1", String(l))), i.setAttribute("d", o.map(c => c.map(u => {
                      if (u.type === "M") return `M${u.x},${u.y}`;
                      if (u.type === "L") return `L${u.x},${u.y}`;
                      if (u.type === "C") return `C${u.x1},${u.y1} ${u.x2},${u.y2} ${u.x},${u.y}`
                    }).join(" ")).join(" "))
                  },
                  y = v => {
                    v.stopImmediatePropagation(), removeEventListener("mousemove", p), removeEventListener("mouseup", y)
                  };
                addEventListener("mousemove", p), addEventListener("mouseup", y)
              })
            }
          }
          if (r.type === "C") {
            D += `C${r.x1},${r.y1} ${r.x2},${r.y2} ${r.x},${r.y}`; {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "line");
              h.setAttribute("x1", String(r.prev.x)), h.setAttribute("y1", String(r.prev.y)), h.setAttribute("x2", String(r.x1)), h.setAttribute("y2", String(r.y1)), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.lines.push(h)
            } {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "line");
              h.setAttribute("x1", String(r.x)), h.setAttribute("y1", String(r.y)), h.setAttribute("x2", String(r.x2)), h.setAttribute("y2", String(r.y2)), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.lines.push(h)
            } {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              h.setAttribute("cx", String(r.x1)), h.setAttribute("cy", String(r.y1)), h.setAttribute("r", String(4)), h.setAttribute("fill", "#f5f5f5"), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.circles.push(h), h.addEventListener("mousedown", g => {
                g.stopImmediatePropagation();
                let p = v => {
                    v.stopImmediatePropagation();
                    let x = e.getBoundingClientRect(),
                      M = v.clientX - x.left,
                      l = v.clientY - x.top;
                    h.setAttribute("cx", String(M)), h.setAttribute("cy", String(l)), r.lines[0].setAttribute("x2", String(M)), r.lines[0].setAttribute("y2", String(l)), r.x1 = M, r.y1 = l, i.setAttribute("d", o.map(d => d.map(c => {
                      if (c.type === "M") return `M${c.x},${c.y}`;
                      if (c.type === "L") return `L${c.x},${c.y}`;
                      if (c.type === "C") return `C${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x},${c.y}`
                    }).join(" ")).join(" "))
                  },
                  y = v => {
                    v.stopImmediatePropagation(), removeEventListener("mousemove", p), removeEventListener("mouseup", y)
                  };
                addEventListener("mousemove", p), addEventListener("mouseup", y)
              })
            } {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              h.setAttribute("cx", String(r.x2)), h.setAttribute("cy", String(r.y2)), h.setAttribute("r", String(4)), h.setAttribute("fill", "#f5f5f5"), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.circles.push(h), h.addEventListener("mousedown", g => {
                g.stopImmediatePropagation();
                let p = v => {
                    v.stopImmediatePropagation();
                    let x = e.getBoundingClientRect(),
                      M = v.clientX - x.left,
                      l = v.clientY - x.top;
                    h.setAttribute("cx", String(M)), h.setAttribute("cy", String(l)), r.lines[1].setAttribute("x2", String(M)), r.lines[1].setAttribute("y2", String(l)), r.x2 = M, r.y2 = l, i.setAttribute("d", o.map(d => d.map(c => {
                      if (c.type === "M") return `M${c.x},${c.y}`;
                      if (c.type === "L") return `L${c.x},${c.y}`;
                      if (c.type === "C") return `C${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x},${c.y}`
                    }).join(" ")).join(" "))
                  },
                  y = v => {
                    v.stopImmediatePropagation(), removeEventListener("mousemove", p), removeEventListener("mouseup", y)
                  };
                addEventListener("mousemove", p), addEventListener("mouseup", y)
              })
            } {
              let h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              h.setAttribute("cx", String(r.x)), h.setAttribute("cy", String(r.y)), h.setAttribute("r", String(4)), h.setAttribute("fill", "#f5f5f5"), h.setAttribute("stroke", "#0B8AFF"), h.setAttribute("stroke-width", "1"), m.appendChild(h), r.circles.push(h), h.addEventListener("mousedown", g => {
                g.stopImmediatePropagation();
                let p = v => {
                    v.stopImmediatePropagation();
                    let x = e.getBoundingClientRect(),
                      M = v.clientX - x.left,
                      l = v.clientY - x.top;
                    h.setAttribute("cx", String(M)), h.setAttribute("cy", String(l)), r.x = M, r.y = l, r.next && r.next.type === "C" && (r.next.lines[0].setAttribute("x1", String(M)), r.next.lines[0].setAttribute("y1", String(l))), r.lines[1].setAttribute("x1", String(M)), r.lines[1].setAttribute("y1", String(l)), i.setAttribute("d", o.map(d => d.map(c => {
                      if (c.type === "M") return `M${c.x},${c.y}`;
                      if (c.type === "L") return `L${c.x},${c.y}`;
                      if (c.type === "C") return `C${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x},${c.y}`
                    }).join(" ")).join(" "))
                  },
                  y = v => {
                    v.stopImmediatePropagation(), removeEventListener("mousemove", p), removeEventListener("mouseup", y)
                  };
                addEventListener("mousemove", p), addEventListener("mouseup", y)
              })
            }
          }
        }
      i.setAttribute("fill", "#40404C"), i.setAttribute("d", D), i.addEventListener("mousedown", b => {
        let r = b.clientX,
          h = b.clientY;
        b.stopImmediatePropagation();
        let g = y => {
            y.stopImmediatePropagation();
            let v = y.clientX - r,
              x = y.clientY - h;
            for (let M of o)
              for (let l of M) l.type === "M" && (l.circles[0].setAttribute("cx", String(l.x + v)), l.circles[0].setAttribute("cy", String(l.y + x))), l.type === "L" && (l.circles[0].setAttribute("cx", String(l.x + v)), l.circles[0].setAttribute("cy", String(l.y + x))), l.type === "C" && (l.lines[0].setAttribute("x1", String(l.prev.x + v)), l.lines[0].setAttribute("y1", String(l.prev.y + x)), l.lines[0].setAttribute("x2", String(l.x1 + v)), l.lines[0].setAttribute("y2", String(l.y1 + x)), l.lines[1].setAttribute("x1", String(l.x + v)), l.lines[1].setAttribute("y1", String(l.y + x)), l.lines[1].setAttribute("x2", String(l.x2 + v)), l.lines[1].setAttribute("y2", String(l.y2 + x)), l.circles[0].setAttribute("cx", String(l.x1 + v)), l.circles[0].setAttribute("cy", String(l.y1 + x)), l.circles[1].setAttribute("cx", String(l.x2 + v)), l.circles[1].setAttribute("cy", String(l.y2 + x)), l.circles[2].setAttribute("cx", String(l.x + v)), l.circles[2].setAttribute("cy", String(l.y + x)));
            i.setAttribute("d", o.map(M => M.map(l => {
              if (l.type === "M") return `M${l.x+v},${l.y+x}`;
              if (l.type === "L") return `L${l.x+v},${l.y+x}`;
              if (l.type === "C") return `C${l.x1+v},${l.y1+x} ${l.x2+v},${l.y2+x} ${l.x+v},${l.y+x}`
            }).join(" ")).join(" "))
          },
          p = y => {
            y.stopImmediatePropagation(), removeEventListener("mousemove", g), removeEventListener("mouseup", p);
            let v = y.clientX - r,
              x = y.clientY - h;
            for (let M of o)
              for (let l of M) l.type === "M" && (l.x = l.x + v, l.y = l.y + x, l.circles[0].setAttribute("cx", String(l.x)), l.circles[0].setAttribute("cy", String(l.y))), l.type === "L" && (l.x = l.x + v, l.y = l.y + x, l.circles[0].setAttribute("cx", String(l.x)), l.circles[0].setAttribute("cy", String(l.y))), l.type === "C" && (l.x1 = l.x1 + v, l.y1 = l.y1 + x, l.x2 = l.x2 + v, l.y2 = l.y2 + x, l.x = l.x + v, l.y = l.y + x, l.lines[0].setAttribute("x1", String(l.prev.x)), l.lines[0].setAttribute("y1", String(l.prev.y)), l.lines[0].setAttribute("x2", String(l.x1)), l.lines[0].setAttribute("y2", String(l.y1)), l.lines[1].setAttribute("x1", String(l.x)), l.lines[1].setAttribute("y1", String(l.y)), l.lines[1].setAttribute("x2", String(l.x2)), l.lines[1].setAttribute("y2", String(l.y2)), l.circles[0].setAttribute("cx", String(l.x1)), l.circles[0].setAttribute("cy", String(l.y1)), l.circles[1].setAttribute("cx", String(l.x2)), l.circles[1].setAttribute("cy", String(l.y2)), l.circles[2].setAttribute("cx", String(l.x)), l.circles[2].setAttribute("cy", String(l.y)));
            i.setAttribute("d", o.map(M => M.map(l => {
              if (l.type === "M") return `M${l.x},${l.y}`;
              if (l.type === "L") return `L${l.x},${l.y}`;
              if (l.type === "C") return `C${l.x1},${l.y1} ${l.x2},${l.y2} ${l.x},${l.y}`
            }).join(" ")).join(" "))
          };
        addEventListener("mousemove", g), addEventListener("mouseup", p)
      }), i.addEventListener("click", b => {
        let r = b.target.closest("[data-group]");
        r.classList.add("active"), requestAnimationFrame(() => {
          addEventListener("click", function h(g) {
            g.composedPath().includes(r) || (removeEventListener("click", h), r.classList.remove("active"))
          })
        })
      }), a.appendChild(i), a.appendChild(m), e.appendChild(a)
    }
    this.appendChild(e)
  }
};
customElements.define("mad-sketcher", je);
var qe = class extends HTMLElement {
  connectedCallback() {
    let e = new Date,
      t = e.toLocaleDateString("en-US", {
        weekday: "short"
      }),
      s = e.toLocaleDateString("en-US", {
        day: "numeric"
      }),
      o = e.toLocaleDateString("en-US", {
        month: "short"
      });
    this.textContent = `${t}. ${s} ${o}`
  }
};
customElements.define("mad-time", qe);
var Ve = class extends HTMLElement {
  constructor() {
    super();
    this.handleWindowClick = this.handleWindowClick.bind(this), this.handleButtonClick = this.handleButtonClick.bind(this)
  }
  connectedCallback() {
    this.mainMenu = this.querySelector(".menu-mobile"), this.mainButton = this.querySelector(".menu-mobile > summary"), this.subMenu = this.querySelector(".menu-mobile__submenu"), this.mainButton.addEventListener("click", this.handleButtonClick), this.items = Array.from(this.querySelectorAll("[data-item]")), window.addEventListener("click", this.handleWindowClick, !0)
  }
  disconnectedCallback() {
    window.removeEventListener("click", this.handleWindowClick, !0)
  }
  handleUrl() {
    let e = new URL(location.href);
    for (let t of this.items) {
      let s = t.querySelector("a");
      new URL(s.href, e).pathname === e.pathname ? t.classList.add("active") : t.classList.remove("active")
    }
  }
  handleButtonClick(e) {
    e.preventDefault(), this.handleUrl(), this.mainMenu.open ? this.close() : this.open()
  }
  open() {
    this.mainMenu.open = !0, this.mainMenu.classList.add("enter"), requestAnimationFrame(() => {
      this.subMenu.classList.remove("exit"), this.mainMenu.classList.remove("enter")
    })
  }
  close() {
    this.mainMenu.classList.add("exit");
    let e = 10,
      t = s => {
        e -= 1, e === 0 && (this.mainMenu.removeEventListener("transitionend", t), this.mainMenu.classList.remove("exit"), this.subMenu.classList.remove("exit"), this.mainMenu.open = !1, this.subMenu.open = !1)
      };
    this.mainMenu.addEventListener("transitionend", t)
  }
  handleWindowClick(e) {
    !this.mainMenu.open || (e.composedPath().includes(this.mainMenu) ? (this.subMenu.classList.add("exit"), e.target instanceof HTMLElement && e.target.closest("a[href]") && this.close()) : (e.preventDefault(), e.stopPropagation(), this.close()))
  }
};
customElements.define("menu-mobile", Ve);
var Ye = class extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this)
  }
  connectedCallback() {
    this.details = this.querySelector("details"), this.summary = this.querySelector("summary"), this.inner = this.querySelector(".inner"), this.summary.addEventListener("click", this.handleClick)
  }
  handleClick(e) {
    this.inner.style.height = `${this.summary.scrollHeight}px`, this.inner.style.overflow = "hidden", this.inner.style.transition = "height 300ms ease", requestAnimationFrame(() => {
      this.inner.style.height = `${this.inner.children[0].scrollHeight}px`, this.inner.addEventListener("transitionend", () => {
        this.inner.style.removeProperty("transition"), this.inner.style.removeProperty("height")
      }, {
        once: !0
      })
    })
  }
};
customElements.define("sub-menu", Ye);
var _, Gt, V, Xe, Ge, Kt, te = {},
  he = [],
  Zt = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

function R(n, e) {
  for (var t in e) n[t] = e[t];
  return n
}

function Ke(n) {
  var e = n.parentNode;
  e && e.removeChild(n)
}

function f(n, e, t) {
  var s, o, i, a = arguments,
    m = {};
  for (i in e) i == "key" ? s = e[i] : i == "ref" ? o = e[i] : m[i] = e[i];
  if (arguments.length > 3)
    for (t = [t], i = 3; i < arguments.length; i++) t.push(a[i]);
  if (t != null && (m.children = t), typeof n == "function" && n.defaultProps != null)
    for (i in n.defaultProps) m[i] === void 0 && (m[i] = n.defaultProps[i]);
  return Y(n, m, s, o, null)
}

function Y(n, e, t, s, o) {
  var i = {
    type: n,
    props: e,
    key: t,
    ref: s,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: o == null ? ++_.__v : o
  };
  return _.vnode != null && _.vnode(i), i
}

function N() {
  return {
    current: null
  }
}

function W(n) {
  return n.children
}

function T(n, e) {
  this.props = n, this.context = e
}

function X(n, e) {
  if (e == null) return n.__ ? X(n.__, n.__.__k.indexOf(n) + 1) : null;
  for (var t; e < n.__k.length; e++)
    if ((t = n.__k[e]) != null && t.__e != null) return t.__e;
  return typeof n.type == "function" ? X(n) : null
}

function Ze(n) {
  var e, t;
  if ((n = n.__) != null && n.__c != null) {
    for (n.__e = n.__c.base = null, e = 0; e < n.__k.length; e++)
      if ((t = n.__k[e]) != null && t.__e != null) {
        n.__e = n.__c.base = t.__e;
        break
      } return Ze(n)
  }
}

function Je(n) {
  (!n.__d && (n.__d = !0) && V.push(n) && !ne.__r++ || Ge !== _.debounceRendering) && ((Ge = _.debounceRendering) || Xe)(ne)
}

function ne() {
  for (var n; ne.__r = V.length;) n = V.sort(function(e, t) {
    return e.__v.__b - t.__v.__b
  }), V = [], n.some(function(e) {
    var t, s, o, i, a, m;
    e.__d && (a = (i = (t = e).__v).__e, (m = t.__P) && (s = [], (o = R({}, i)).__v = i.__v + 1, ue(m, i, o, t.__n, m.ownerSVGElement !== void 0, i.__h != null ? [a] : null, s, a == null ? X(i) : a, i.__h), Qe(s, i), i.__e != a && Ze(i)))
  })
}

function st(n, e, t, s, o, i, a, m, D, b) {
  var r, h, g, p, y, v, x, M = s && s.__k || he,
    l = M.length;
  for (t.__k = [], r = 0; r < e.length; r++)
    if ((p = t.__k[r] = (p = e[r]) == null || typeof p == "boolean" ? null : typeof p == "string" || typeof p == "number" ? Y(null, p, null, null, p) : Array.isArray(p) ? Y(W, {
        children: p
      }, null, null, null) : p.__b > 0 ? Y(p.type, p.props, p.key, null, p.__v) : p) != null) {
      if (p.__ = t, p.__b = t.__b + 1, (g = M[r]) === null || g && p.key == g.key && p.type === g.type) M[r] = void 0;
      else
        for (h = 0; h < l; h++) {
          if ((g = M[h]) && p.key == g.key && p.type === g.type) {
            M[h] = void 0;
            break
          }
          g = null
        }
      ue(n, p, g = g || te, o, i, a, m, D, b), y = p.__e, (h = p.ref) && g.ref != h && (x || (x = []), g.ref && x.push(g.ref, null, p), x.push(h, p.__c || y, p)), y != null ? (v == null && (v = y), typeof p.type == "function" && p.__k != null && p.__k === g.__k ? p.__d = D = et(p, D, n) : D = tt(n, p, g, M, y, D), b || t.type !== "option" ? typeof t.type == "function" && (t.__d = D) : n.value = "") : D && g.__e == D && D.parentNode != n && (D = X(g))
    } for (t.__e = v, r = l; r--;) M[r] != null && (typeof t.type == "function" && M[r].__e != null && M[r].__e == t.__d && (t.__d = X(s, r + 1)), it(M[r], M[r]));
  if (x)
    for (r = 0; r < x.length; r++) nt(x[r], x[++r], x[++r])
}

function et(n, e, t) {
  var s, o;
  for (s = 0; s < n.__k.length; s++)(o = n.__k[s]) && (o.__ = n, e = typeof o.type == "function" ? et(o, e, t) : tt(t, o, o, n.__k, o.__e, e));
  return e
}

function tt(n, e, t, s, o, i) {
  var a, m, D;
  if (e.__d !== void 0) a = e.__d, e.__d = void 0;
  else if (t == null || o != i || o.parentNode == null) e: if (i == null || i.parentNode !== n) n.appendChild(o), a = null;
    else {
      for (m = i, D = 0;
        (m = m.nextSibling) && D < s.length; D += 2)
        if (m == o) break e;
      n.insertBefore(o, i), a = i
    } return a !== void 0 ? a : o.nextSibling
}

function Jt(n, e, t, s, o) {
  var i;
  for (i in t) i === "children" || i === "key" || i in e || ie(n, i, null, t[i], s);
  for (i in e) o && typeof e[i] != "function" || i === "children" || i === "key" || i === "value" || i === "checked" || t[i] === e[i] || ie(n, i, e[i], t[i], s)
}

function rt(n, e, t) {
  e[0] === "-" ? n.setProperty(e, t) : n[e] = t == null ? "" : typeof t != "number" || Zt.test(e) ? t : t + "px"
}

function ie(n, e, t, s, o) {
  var i;
  e: if (e === "style")
    if (typeof t == "string") n.style.cssText = t;
    else {
      if (typeof s == "string" && (n.style.cssText = s = ""), s)
        for (e in s) t && e in t || rt(n.style, e, "");
      if (t)
        for (e in t) s && t[e] === s[e] || rt(n.style, e, t[e])
    }
  else if (e[0] === "o" && e[1] === "n") i = e !== (e = e.replace(/Capture$/, "")), e = e.toLowerCase() in n ? e.toLowerCase().slice(2) : e.slice(2), n.l || (n.l = {}), n.l[e + i] = t, t ? s || n.addEventListener(e, i ? at : ot, i) : n.removeEventListener(e, i ? at : ot, i);
  else if (e !== "dangerouslySetInnerHTML") {
    if (o) e = e.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
    else if (e !== "href" && e !== "list" && e !== "form" && e !== "download" && e in n) try {
      n[e] = t == null ? "" : t;
      break e
    } catch (a) {}
    typeof t == "function" || (t != null && (t !== !1 || e[0] === "a" && e[1] === "r") ? n.setAttribute(e, t) : n.removeAttribute(e))
  }
}

function ot(n) {
  this.l[n.type + !1](_.event ? _.event(n) : n)
}

function at(n) {
  this.l[n.type + !0](_.event ? _.event(n) : n)
}

function ue(n, e, t, s, o, i, a, m, D) {
  var b, r, h, g, p, y, v, x, M, l, d, c = e.type;
  if (e.constructor !== void 0) return null;
  t.__h != null && (D = t.__h, m = e.__e = t.__e, e.__h = null, i = [m]), (b = _.__b) && b(e);
  try {
    e: if (typeof c == "function") {
      if (x = e.props, M = (b = c.contextType) && s[b.__c], l = b ? M ? M.props.value : b.__ : s, t.__c ? v = (r = e.__c = t.__c).__ = r.__E : ("prototype" in c && c.prototype.render ? e.__c = r = new c(x, l) : (e.__c = r = new T(x, l), r.constructor = c, r.render = en), M && M.sub(r), r.props = x, r.state || (r.state = {}), r.context = l, r.__n = s, h = r.__d = !0, r.__h = []), r.__s == null && (r.__s = r.state), c.getDerivedStateFromProps != null && (r.__s == r.state && (r.__s = R({}, r.__s)), R(r.__s, c.getDerivedStateFromProps(x, r.__s))), g = r.props, p = r.state, h) c.getDerivedStateFromProps == null && r.componentWillMount != null && r.componentWillMount(), r.componentDidMount != null && r.__h.push(r.componentDidMount);
      else {
        if (c.getDerivedStateFromProps == null && x !== g && r.componentWillReceiveProps != null && r.componentWillReceiveProps(x, l), !r.__e && r.shouldComponentUpdate != null && r.shouldComponentUpdate(x, r.__s, l) === !1 || e.__v === t.__v) {
          r.props = x, r.state = r.__s, e.__v !== t.__v && (r.__d = !1), r.__v = e, e.__e = t.__e, e.__k = t.__k, r.__h.length && a.push(r);
          break e
        }
        r.componentWillUpdate != null && r.componentWillUpdate(x, r.__s, l), r.componentDidUpdate != null && r.__h.push(function() {
          r.componentDidUpdate(g, p, y)
        })
      }
      r.context = l, r.props = x, r.state = r.__s, (b = _.__r) && b(e), r.__d = !1, r.__v = e, r.__P = n, b = r.render(r.props, r.state, r.context), r.state = r.__s, r.getChildContext != null && (s = R(R({}, s), r.getChildContext())), h || r.getSnapshotBeforeUpdate == null || (y = r.getSnapshotBeforeUpdate(g, p)), d = b != null && b.type === W && b.key == null ? b.props.children : b, st(n, Array.isArray(d) ? d : [d], e, t, s, o, i, a, m, D), r.base = e.__e, e.__h = null, r.__h.length && a.push(r), v && (r.__E = r.__ = null), r.__e = !1
    } else i == null && e.__v === t.__v ? (e.__k = t.__k, e.__e = t.__e) : e.__e = Qt(t.__e, e, t, s, o, i, a, D);
    (b = _.diffed) && b(e)
  }
  catch (u) {
    e.__v = null, (D || i != null) && (e.__e = m, e.__h = !!D, i[i.indexOf(m)] = null), _.__e(u, e, t)
  }
}

function Qe(n, e) {
  _.__c && _.__c(e, n), n.some(function(t) {
    try {
      n = t.__h, t.__h = [], n.some(function(s) {
        s.call(t)
      })
    } catch (s) {
      _.__e(s, t.__v)
    }
  })
}

function Qt(n, e, t, s, o, i, a, m) {
  var D, b, r, h, g = t.props,
    p = e.props,
    y = e.type,
    v = 0;
  if (y === "svg" && (o = !0), i != null) {
    for (; v < i.length; v++)
      if ((D = i[v]) && (D === n || (y ? D.localName == y : D.nodeType == 3))) {
        n = D, i[v] = null;
        break
      }
  }
  if (n == null) {
    if (y === null) return document.createTextNode(p);
    n = o ? document.createElementNS("http://www.w3.org/2000/svg", y) : document.createElement(y, p.is && p), i = null, m = !1
  }
  if (y === null) g === p || m && n.data === p || (n.data = p);
  else {
    if (i = i && he.slice.call(n.childNodes), b = (g = t.props || te).dangerouslySetInnerHTML, r = p.dangerouslySetInnerHTML, !m) {
      if (i != null)
        for (g = {}, h = 0; h < n.attributes.length; h++) g[n.attributes[h].name] = n.attributes[h].value;
      (r || b) && (r && (b && r.__html == b.__html || r.__html === n.innerHTML) || (n.innerHTML = r && r.__html || ""))
    }
    if (Jt(n, p, g, o, m), r) e.__k = [];
    else if (v = e.props.children, st(n, Array.isArray(v) ? v : [v], e, t, s, o && y !== "foreignObject", i, a, n.firstChild, m), i != null)
      for (v = i.length; v--;) i[v] != null && Ke(i[v]);
    m || ("value" in p && (v = p.value) !== void 0 && (v !== n.value || y === "progress" && !v) && ie(n, "value", v, g.value, !1), "checked" in p && (v = p.checked) !== void 0 && v !== n.checked && ie(n, "checked", v, g.checked, !1))
  }
  return n
}

function nt(n, e, t) {
  try {
    typeof n == "function" ? n(e) : n.current = e
  } catch (s) {
    _.__e(s, t)
  }
}

function it(n, e, t) {
  var s, o, i;
  if (_.unmount && _.unmount(n), (s = n.ref) && (s.current && s.current !== n.__e || nt(s, null, e)), t || typeof n.type == "function" || (t = (o = n.__e) != null), n.__e = n.__d = void 0, (s = n.__c) != null) {
    if (s.componentWillUnmount) try {
      s.componentWillUnmount()
    } catch (a) {
      _.__e(a, e)
    }
    s.base = s.__P = null
  }
  if (s = n.__k)
    for (i = 0; i < s.length; i++) s[i] && it(s[i], e, t);
  o != null && Ke(o)
}

function en(n, e, t) {
  return this.constructor(n, t)
}

function G(n, e, t) {
  var s, o, i;
  _.__ && _.__(n, e), o = (s = typeof t == "function") ? null : t && t.__k || e.__k, i = [], ue(e, n = (!s && t || e).__k = f(W, null, [n]), o || te, te, e.ownerSVGElement !== void 0, !s && t ? [t] : o ? null : e.firstChild ? he.slice.call(e.childNodes) : null, i, !s && t ? t : o ? o.__e : e.firstChild, s), Qe(i, n)
}

function K(n, e) {
  G(n, e, K)
}

function me(n, e, t) {
  var s, o, i, a = arguments,
    m = R({}, n.props);
  for (i in e) i == "key" ? s = e[i] : i == "ref" ? o = e[i] : m[i] = e[i];
  if (arguments.length > 3)
    for (t = [t], i = 3; i < arguments.length; i++) t.push(a[i]);
  return t != null && (m.children = t), Y(n.type, m, s || n.key, o || n.ref, null)
}
_ = {
  __e: function(n, e) {
    for (var t, s, o; e = e.__;)
      if ((t = e.__c) && !t.__) try {
        if ((s = t.constructor) && s.getDerivedStateFromError != null && (t.setState(s.getDerivedStateFromError(n)), o = t.__d), t.componentDidCatch != null && (t.componentDidCatch(n), o = t.__d), o) return t.__E = t
      } catch (i) {
        n = i
      }
    throw n
  },
  __v: 0
}, Gt = function(n) {
  return n != null && n.constructor === void 0
}, T.prototype.setState = function(n, e) {
  var t;
  t = this.__s != null && this.__s !== this.state ? this.__s : this.__s = R({}, this.state), typeof n == "function" && (n = n(R({}, t), this.props)), n && R(t, n), n != null && this.__v && (e && this.__h.push(e), Je(this))
}, T.prototype.forceUpdate = function(n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), Je(this))
}, T.prototype.render = W, V = [], Xe = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, ne.__r = 0, Kt = 0;

function pe() {
  return (pe = Object.assign || function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (n[s] = t[s])
    }
    return n
  }).apply(this, arguments)
}

function tn(n) {
  this.getChildContext = function() {
    return n.context
  };
  var e = n.children,
    t = function(s, o) {
      if (s == null) return {};
      var i, a, m = {},
        D = Object.keys(s);
      for (a = 0; a < D.length; a++) o.indexOf(i = D[a]) >= 0 || (m[i] = s[i]);
      return m
    }(n, ["context", "children"]);
  return me(e, t)
}

function nn() {
  var n = new CustomEvent("_preact", {
    detail: {},
    bubbles: !0,
    cancelable: !0
  });
  this.dispatchEvent(n), this._vdom = f(tn, pe({}, this._props, {
    context: n.detail.context
  }), function e(t, s) {
    if (t.nodeType === 3) return t.data;
    if (t.nodeType !== 1) return null;
    var o = [],
      i = {},
      a = 0,
      m = t.attributes,
      D = t.childNodes;
    for (a = m.length; a--;) m[a].name !== "slot" && (i[m[a].name] = m[a].value, i[lt(m[a].name)] = m[a].value);
    for (a = D.length; a--;) {
      var b = e(D[a], null),
        r = D[a].slot;
      r ? i[r] = f(ct, {
        name: r
      }, b) : o[a] = b
    }
    var h = s ? f(ct, null, o) : o;
    return f(s || t.nodeName.toLowerCase(), i, h)
  }(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? K : G)(this._vdom, this._root)
}

function lt(n) {
  return n.replace(/-(\w)/g, function(e, t) {
    return t ? t.toUpperCase() : ""
  })
}

function sn(n, e, t) {
  if (this._vdom) {
    var s = {};
    s[n] = t = t == null ? void 0 : t, s[lt(n)] = t, this._vdom = me(this._vdom, s), G(this._vdom, this._root)
  }
}

function rn() {
  G(this._vdom = null, this._root)
}

function ct(n, e) {
  var t = this;
  return f("slot", pe({}, n, {
    ref: function(s) {
      s ? (t.ref = s, t._listener || (t._listener = function(o) {
        o.stopPropagation(), o.detail.context = e
      }, s.addEventListener("_preact", t._listener))) : t.ref.removeEventListener("_preact", t._listener)
    }
  }))
}

function O(n, e, t, s) {
  function o() {
    var i = Reflect.construct(HTMLElement, [], o);
    return i._vdomComponent = n, i._root = s && s.shadow ? i.attachShadow({
      mode: "open"
    }) : i, i
  }
  return (o.prototype = Object.create(HTMLElement.prototype)).constructor = o, o.prototype.connectedCallback = nn, o.prototype.attributeChangedCallback = sn, o.prototype.disconnectedCallback = rn, t = t || n.observedAttributes || Object.keys(n.propTypes || {}), o.observedAttributes = t, t.forEach(function(i) {
    Object.defineProperty(o.prototype, i, {
      get: function() {
        return this._vdom.props[i]
      },
      set: function(a) {
        this._vdom ? this.attributeChangedCallback(i, null, a) : (this._props || (this._props = {}), this._props[i] = a, this.connectedCallback());
        var m = typeof a;
        a != null && m !== "string" && m !== "boolean" && m !== "number" || this.setAttribute(i, a)
      }
    })
  }), customElements.define(e || n.tagName || n.displayName || n.name, o)
}
var fe = class extends T {
    constructor(e) {
      super(e);
      this.id = 0;
      this.toggleItem = (e, t) => {
        this.setState({
          items: this.state.items.map(s => s.id === e ? I(I({}, s), {
            checked: !s.checked
          }) : s)
        }, t)
      };
			this.scrollContainerRef = N(), this.addItem = this.addItem.bind(this), this.state = {
        items: [{
          id: this.id++,
          checked: !1,
          text: "I love to Innovate"
        }, {
          id: this.id++,
          checked: !1,
          text: "I don't play it safe"
        }, {
          id: this.id++,
          checked: !1,
          text: "I am honest and transparent"
        }, {
          id: this.id++,
          checked: !1,
          text: "Partnerships over one-nighters"
        }, {
          id: this.id++,
          checked: !1,
          text: "Prototypes over presentations"
        }, {
          id: this.id++,
          checked: !1,
          text: "People over process"
        }, {
          id: this.id++,
          checked: !1,
          text: "No meetings on Fridays"
        }, {
          id: this.id++,
          checked: !1,
          text: "Milestones over deadlines"
        }, {
          id: this.id++,
          checked: !1,
          text: "Sensibility if the best virtue"
        }, {
          id: this.id++,
          checked: !1,
          text: "Quality first and foremost"
        }]
      }
    }
    addItem(e) {
      e === void 0 && (e = this.state.items.length - 1), this.setState({
        items: [...this.state.items.slice(0, e + 1), {
          id: this.id++,
          checked: !1,
          text: ""
        }, ...this.state.items.slice(e + 1)]
      }, () => {
        let t = this.base,
          s = this.scrollContainerRef.current,
          o = t.querySelector(`[data-id="${this.id-1}"]`);
        s && s.scrollTo(0, s.scrollHeight), o && o.focus()
      })
    }
    removeItem(e) {
      let t = this.state.items.find(a => a.id === e),
        s = this.state.items.indexOf(t),
        o = this.state.items[s - 1],
        i = this.state.items[s + 1];
      this.setState({
        items: this.state.items.filter(a => a.id !== e)
      }, () => {
        o ? setTimeout(() => {
          var a;
          return (a = this.base.querySelector(`[data-id="${o.id}"]`)) == null ? void 0 : a.focus()
        }) : i && setTimeout(() => {
          var a;
          return (a = this.base.querySelector(`[data-id="${i.id}"]`)) == null ? void 0 : a.focus()
        })
      })
    }
    updateItem(e, t, s) {
      this.setState({
        items: this.state.items.map(o => o.id === e ? I(I({}, o), {
          text: t
        }) : o)
      }, s)
    }
    render() {
      return f("div", {
        class: "applet-reminders-container"
      }, f("header", {
        class: "applet-header applet-header--solid"
      }, f("h3", {
        class: "visually-hidden"
      }, "Reminders"), f("p", {
        "aria-hidden": "true"
      }, "Reminders")), f("div", {
        class: "reminders-list applet-content",
        ref: this.scrollContainerRef
      }, f("div", {
        class: "reminders-list__header"
      }, f("p", {
        class: "bold"
      }, "Commandments"), f("p", null, this.state.items.map(e => e.checked ? 0 : 1).reduce((e, t) => e + t, 0))), f("div", {
        class: "reminders-list__items"
      }, this.state.items.map((e, t) => f(dt, I(I({}, e), {
        key: e.id,
        onAdd: s => this.updateItem(e.id, s, () => {
          this.addItem(t)
        }),
        onRemove: () => this.removeItem(e.id),
        onChange: s => this.updateItem(e.id, s),
        onToggle: () => this.toggleItem(e.id)
      }))))), f("button", {
        class: "reminders-list__btn",
        onClick: () => this.addItem()
      }, f("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg"
      }, f("path", {
        d: "M9.75 16C9.75 16.4142 9.41421 16.75 9 16.75C8.58579 16.75 8.25 16.4142 8.25 16L8.25 9.75L2 9.75C1.58579 9.75 1.25 9.41421 1.25 9C1.25 8.58579 1.58579 8.25 2 8.25L8.25 8.25L8.25 2C8.25 1.58579 8.58579 1.25 9 1.25C9.41421 1.25 9.75 1.58579 9.75 2V8.25L16 8.25C16.4142 8.25 16.75 8.58579 16.75 9C16.75 9.41421 16.4142 9.75 16 9.75L9.75 9.75V16Z",
        fill: "white"
      })), f("span", {
        class: "visually-hidden"
      }, "Add to list")))
    }
  },
  dt = class extends T {
    constructor(e) {
      super(e);
      this.handleKeydown = e => {
        e.key === "Enter" && this.props.onAdd(e.target.value), e.key === "Backspace" && e.target.value === "" && this.props.onRemove()
      };
      this.handleToggle = e => {
        this.props.onToggle()
      };
      this.handleChange = e => {
        this.props.onChange(e.target.value)
      };
      this.inputRef = N()
    }
    render() {
      return f("div", {
        class: "reminders-list__item",
        "data-nodrag": !0
      }, f("input", {
        type: "checkbox",
        checked: this.props.checked,
        onClick: this.handleToggle
      }), f("input", {
        type: "text",
        "data-id": this.props.id,
        ref: this.inputRef,
        value: this.props.text,
        onChange: this.handleChange,
        onKeyDown: this.handleKeydown
      }))
    }
  };
O(fe, "mad-reminders");
var ht = class extends T {
  constructor() {
    super();
    this.state = {
      currentTemp: "\u2013",
      description: "\u2013"
    }
  }
  componentDidMount() {
    this.fetchData()
  }
  fetchData() {
    fetch("/weather").then(e => e.json()).then(e => {
      this.setState({
        currentTemp: String(Math.round(e.temperature)),
        description: e.description
      })
    }).catch(e => {
      console.log("fetching weather failed", e)
    })
  }
  render() {
    return f(W, null, f("p", {
      class: "map-panel__title"
    }, this.state.currentTemp, "\xB0"), f("p", null, this.state.description))
  }
};
O(ht, "preact-weather");
var ut = new IntersectionObserver(n => {
    for (let e of n) e.isIntersecting ? e.target.startLoading() : e.target.stopLoading()
  }, {
    rootMargin: "50% 0%"
  }),
  mt = new IntersectionObserver(n => {
    for (let e of n) e.isIntersecting ? e.target.play() : e.target.pause()
  }, {
    threshold: .25
  }),
  pt = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.video = null;
      this.playingPromise = Promise.resolve();
      this.startLoading = () => {
        this.video && this.video.setAttribute("preload", "auto")
      };
      this.stopLoading = () => {
        this.video && this.video.setAttribute("preload", "none")
      };
      this.play = () => {
        this.video && this.video.paused && (this.playingPromise = this.video.play().catch(() => {}))
      };
      this.pause = () => {
        this.video && !this.video.paused && this.playingPromise.then(() => {
          this.video.pause()
        })
      }
    }
    connectedCallback() {
      this.video = this.querySelector("video"), ut.observe(this), mt.observe(this)
    }
    disconnectedCallback() {
      ut.unobserve(this), mt.unobserve(this)
    }
  };
customElements.define("smart-pause", pt);
var ft = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.handleTouchStart = () => {
      addEventListener("touchend", this.handleTouchEnd), addEventListener("touchcancel", this.handleTouchEnd), this.article.classList.add("is-touching")
    };
    this.handleTouchEnd = () => {
      removeEventListener("touchend", this.handleTouchEnd), removeEventListener("touchcancel", this.handleTouchEnd), this.article.classList.remove("is-touching")
    }
  }
  connectedCallback() {
    this.article = this.querySelector("article"), this.addEventListener("touchstart", this.handleTouchStart)
  }
  disconnectedCallback() {
    this.removeEventListener("touchstart", this.handleTouchStart), removeEventListener("touchend", this.handleTouchEnd), removeEventListener("touchcancel", this.handleTouchEnd)
  }
};
customElements.define("team-cell", ft);
var De = "@MAD:dashboard-positions";
var Dt = {
    default: {
      "applet-about": {
        left: 495.4569999999999,
        top: 49.15208860759492,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 119
      },
      "applet-logo": {
        left: 110.17000000000007,
        top: 21.711661392405063,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 65
      },
      "applet-notes": {
        left: 654.239,
        top: 398.10108386075945,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 118
      },
      "applet-work": {
        left: 48.52999999999997,
        top: 466.7499525316456,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 96
      },
      "applet-map": {
        left: 1077.824,
        top: 497.7237658227848,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 94
      },
      "applet-reminders": {
        left: 1244.9229999999998,
        top: 42.44028481012657,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 71
      },
      "applet-social": {
        left: 1177.681,
        top: 120.45574367088602,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 107
      },
      "btn-work": {
        left: 415.9801904761905,
        top: 507.40886075949356,
        width: 0,
        height: 0,
        windowWidth: 1664,
        windowHeight: 945,
        zIndex: 124
      },
      "btn-about": {
        left: 167.47641904761906,
        top: 361.1555379746835,
        width: 0,
        height: 0,
        windowWidth: 1664,
        windowHeight: 945,
        zIndex: 122
      },
      "btn-team": {
        left: 476.42857142857133,
        top: 414.9551582278482,
        width: 0,
        height: 0,
        windowWidth: 1664,
        windowHeight: 945,
        zIndex: 123
      },
      "btn-contact": {
        left: 1460.8023846153847,
        top: 741.5489240506329,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 127
      },
      "btn-careers": {
        left: 1055.9050666666667,
        top: 398.43841772151904,
        width: 0,
        height: 0,
        windowWidth: 1664,
        windowHeight: 945,
        zIndex: 125
      },
      "applet-showreel": {
        left: 463.2342240326011,
        top: 613.2434681748314,
        width: 0,
        height: 0,
        windowWidth: 1680,
        windowHeight: 945,
        zIndex: 117
      }
    }
  },
  gt = class extends HTMLElement {
    constructor() {
      super();
      this.onChildMouseUp = this.onChildMouseUp.bind(this), this.onWindowResize = q(this.onWindowResize.bind(this)), this.saveToLocalStorage = q(this.saveToLocalStorage.bind(this)), this.positions = Object.assign({}, Dt), this.selectedPosition = Object.keys(this.positions)[0];
      let e = localStorage.getItem(De);
      if (e) {
        let t = JSON.parse(e);
        Object.assign(this.positions, t)
      }
    }
    connectedCallback() {
      if (!(window.innerWidth <= 767)) {
        this.positionAll();
        for (let e of Array.from(this.querySelectorAll("draggable-element"))) e.addEventListener("mouseup", this.onChildMouseUp);
        this.classList.add("dashboard--initialized"), window.addEventListener("resize", this.onWindowResize)
      }
    }
    disconnectedCallback() {
      window.addEventListener("resize", this.onWindowResize);
      for (let e of Array.from(this.querySelectorAll("draggable-element"))) e.removeEventListener("mouseup", this.onChildMouseUp)
    }
    onWindowResize() {
      this.positionAll()
    }
    onChildMouseUp(e) {
      let t = e.currentTarget;
      t instanceof ee && requestAnimationFrame(() => {
        setTimeout(() => {
          this.save(t)
        })
      })
    }
    saveToLocalStorage() {
      let e = {};
      for (let [t, s] of Object.entries(this.positions)) Dt.hasOwnProperty(t) || (e[t] = s);
      localStorage.setItem(De, JSON.stringify(e))
    }
    saveAll() {
      for (let e of Array.from(this.querySelectorAll("draggable-element"))) this.save(e)
    }
    save(e) {
      let t = this.positions[this.selectedPosition][e.id];
      t.left = e.offsetX, t.top = e.offsetY, t.windowWidth = window.innerWidth, t.windowHeight = window.innerHeight, t.zIndex = Number(e.style.zIndex) || 0, this.saveToLocalStorage()
    }
    transitionIn() {
      if (!z.matches) return;
      let e = window.innerWidth,
        t = window.innerHeight,
        s = Array.from(this.querySelectorAll("draggable-element")),
        o = s.map(i => i.getBoundingClientRect());
      for (let i = 0; i < s.length; i++) {
        let a = s[i],
          m = o[i],
          D = m.left + .5 * m.width - .5 * e,
          b = m.top + .5 * m.height - .5 * t;
        Math.abs(D) >= Math.abs(b) ? a.style.setProperty("--x", `${a.offsetX+Math.sign(D)*.5*e}px`) : a.style.setProperty("--y", `${a.offsetY+Math.sign(b)*.5*t}px`), requestAnimationFrame(() => {
          a.style.transformOrigin = "center center", a.style.transition = "transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)", a.addEventListener("transitionend", () => {
            a.style.removeProperty("transform-origin"), a.style.removeProperty("transition")
          }, {
            once: !0
          }), a.style.setProperty("--x", `${a.offsetX}px`), a.style.setProperty("--y", `${a.offsetY}px`)
        })
      }
    }
    transitionOut() {
      if (!z.matches) return;
      let e = window.innerWidth,
        t = window.innerHeight,
        s = Array.from(this.querySelectorAll("draggable-element")),
        o = s.map(i => i.getBoundingClientRect());
      for (let i = 0; i < s.length; i++) {
        let a = s[i],
          m = o[i],
          D = m.left + .5 * m.width - .5 * e,
          b = m.top + .5 * m.height - .5 * t,
          r = Math.abs(D) >= Math.abs(b);
        a.style.transformOrigin = "center center", a.style.transition = "transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)", a.addEventListener("transitionend", () => {
          a.style.removeProperty("transform-origin"), a.style.removeProperty("transition")
        }, {
          once: !0
        }), r ? a.style.setProperty("--x", `${a.offsetX+Math.sign(D)*.5*e}px`) : a.style.setProperty("--y", `${a.offsetY+Math.sign(b)*.5*t}px`)
      }
    }
    positionAll() {
      let e = window.innerWidth,
        t = window.innerHeight,
        s = Array.from(this.querySelectorAll("draggable-element"));
      for (let o of s) {
        let i = this.positions[this.selectedPosition][o.id];
        if (!i) continue;
        let a = i.windowWidth,
          m = i.windowHeight,
          D = i.left + .5 * i.width - .5 * a,
          b = i.top + .5 * i.height - .5 * m,
          r = e - a,
          h = t - m,
          g = D * (1 + r / a),
          p = b * (1 + h / m);
        o.offsetX = g - .5 * i.width + .5 * e, o.offsetY = p - .5 * i.height + .5 * t, o.style.setProperty("--x", `${o.offsetX}px`), o.style.setProperty("--y", `${o.offsetY}px`), o.style.zIndex = String(i.zIndex), ae(i.zIndex)
      }
    }
  };
customElements.define("mad-dashboard", gt);
var vt = document.createElement("template");
vt.innerHTML = `
	<style>
		div {
			position: relative;
		}
		button {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			border: none;
			background: transparent;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			cursor: pointer;
			transition: opacity 150ms ease;
			outline: none;
			z-index: 1;
		}
		button:hover {
			opacity: 0.7;
		}
		button path {
			-webkit-backdrop-filter: blur(var(--backdrop-blur-radius));
			backdrop-filter: blur(var(--backdrop-blur-radius));
		}
	</style>
	<div>
		<slot></slot>
		<button>
			<svg width="102" height="102" viewBox="0 0 102 102" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M51 74C65.9117 74 78 61.9117 78 47C78 32.0883 65.9117 20 51 20C36.0883 20 24 32.0883 24 47C24 61.9117 36.0883 74 51 74ZM63.3276 48.6051C64.5688 47.82 64.5688 46.0096 63.3276 45.2245L47.0691 34.9412C45.7374 34.0989 44 35.0558 44 36.6314L44 57.1981C44 58.7738 45.7374 59.7307 47.0691 58.8884L63.3276 48.6051Z" fill="#FDFDFD" fill-opacity="0.8"/>
			</svg>
		</button>
	</div>
`;
var bt = class extends HTMLElement {
  constructor() {
    super();
    this.toggleVideo = this.toggleVideo.bind(this), this.playVideo = this.playVideo.bind(this), this.pauseVideo = this.pauseVideo.bind(this), this.attachShadow({
      mode: "open"
    }), this.shadowRoot.appendChild(vt.content.cloneNode(!0))
  }
  connectedCallback() {
    this.video = this.querySelector("video"), this.button = this.shadowRoot.querySelector("button"), this.video.addEventListener("ended", this.handleVideoEnded), this.video.addEventListener("click", this.toggleVideo), this.button.addEventListener("click", this.playVideo), this.setAttribute("paused", "")
  }
  disconnectedCallback() {
    this.video.removeEventListener("ended", this.handleVideoEnded), this.video.removeEventListener("click", this.toggleVideo), this.button.removeEventListener("click", this.playVideo)
  }
  handleVideoEnded() {
    this.button.hidden = !1
  }
  toggleVideo() {
    this.video.paused ? this.playVideo() : this.pauseVideo()
  }
  playVideo() {
    this.video.play().then(() => {
      this.button.hidden = !0, this.removeAttribute("paused"), this.setAttribute("has-started", "")
    }).catch(e => {
      console.error(e)
    })
  }
  pauseVideo() {
    this.video.pause(), this.button.hidden = !1, this.setAttribute("paused", "")
  }
};
customElements.define("video-player", bt);

function xt(n, e) {
  return n === e.url
}

function on(n, e) {
  for (let t of e)
    if (xt(n, t)) return !0;
  return !1
}

var ge = class extends T {
  constructor(e) {
    super(e);
    this.innerRef = N(), this.currentItemRef = N(), this.pillRef = N(), this.handleClickOutside = this.handleClickOutside.bind(this), this.handleItemMouseEnter = this.handleItemMouseEnter.bind(this), this.handleItemsMouseLeave = this.handleItemsMouseLeave.bind(this), this.setActivePathname = this.setActivePathname.bind(this), this.clearActivePathname = this.clearActivePathname.bind(this), this.activeSubmenu = null, this.closingTimeout = null, this.state = {
      initialized: !1,
      activePathname: null,
      items: [{
        url: "https://www.sublimeforest.com/home",
        title: "Home"
      },
        {
        url: "https://sublimeforest.com/about",
        title: "About"
      },{
        url: "https://sublimeforest.com/research",
        title: "Research"
      },{
        url:"https://sublimeforest.com/playground",
        title: "Playground"
      } ,{
        url: "/contact",
        title: "Contact",
        items: [{
          url: "mailto:arcadiahms@gmail.com",
          title: "Email"
        }, {
          url: "https://www.linkedin.com/in/soni0909/",
          title: "Linkedin"
        },{
          url: "https://www.researchgate.net/profile/Harshal-Soni",
          title: "ResearchGate"
        }]
      }]
    }
  }
  componentDidMount() {
    window.addEventListener("click", this.handleClickOutside, !0), requestAnimationFrame(() => {
      this.transition(this.currentItemRef.current), this.setState({
        initialized: !0
      })
    })
  }
  componentWillUnmount() {
    window.removeEventListener("click", this.handleClickOutside)
  }
  componentDidUpdate(e, t) {
    this.props.currentPathname !== e.currentPathname && (this.transition(this.currentItemRef.current), this.clearActivePathname(), this.closeSubmenu())
  }
  setActivePathname(e, t) {
    this.setState({
      activePathname: e
    }, () => {
      this.transition(t || this.currentItemRef.current)
    })
  }
  clearActivePathname() {
    this.setActivePathname(null)
  }
  openSubmenu(e, t) {
    this.activeSubmenu = {
      url: e,
      details: t
    }, t.classList.add("enter"), requestAnimationFrame(() => {
      t.classList.remove("enter")
    })
  }
  closeSubmenu() {
    if (!!this.activeSubmenu) {
      if (this.activeSubmenu.details !== null) {
        let {
          details: e
        } = this.activeSubmenu;
        e.classList.add("exit"), e.addEventListener("transitionend", () => {
          e.classList.remove("exit"), e.open = !1, e.querySelector("summary").blur()
        }, {
          once: !0
        })
      }
      this.activeSubmenu = null
    }
  }
  handleClickOutside(e) {
    e.composedPath().includes(this.base) || (this.closeSubmenu(), this.clearActivePathname())
  }
  handleItemMouseEnter(e, t) {
    this.closingTimeout && (clearTimeout(this.closingTimeout), this.closingTimeout = null), this.activeSubmenu && this.activeSubmenu.url !== t && this.closeSubmenu(), this.setActivePathname(t, e.currentTarget)
  }
  handleItemsMouseLeave() {
    this.activeSubmenu ? this.closingTimeout = setTimeout(() => {
      this.clearActivePathname(), this.closeSubmenu()
    }, 1e3) : this.clearActivePathname()
  }
  handleSummaryClick(e, t) {
    let o = e.currentTarget.parentNode;
    o.open ? (e.preventDefault(), this.closeSubmenu()) : this.openSubmenu(t, o)
  }
  transition(e) {
    if (!e) return;
    let s = this.innerRef.current.getBoundingClientRect(),
      o = (e.firstElementChild || e).getBoundingClientRect(),
      i = o.left - s.left,
      a = o.width,
      m = this.pillRef.current;
    m.style.left = `${i}px`, m.style.width = `${a}px`
  }
  render() {
    let e = this.state.activePathname || on(this.props.currentPathname, this.state.items);
    return f("nav", {
      class: `menu-desktop ${this.state.initialized?"menu-desktop--initialized":""}`
    }, f("div", {
      class: "menu-desktop__inner",
      ref: this.innerRef
    }, f("div", {
      class: `menu-desktop__pill ${e?"menu-desktop__pill--active":""}`,
      ref: this.pillRef
    }), f("ul", {
      class: "menu-desktop__items",
      onMouseLeave: this.handleItemsMouseLeave
    },
        this.state.items.map(t => {

      let s = this.state.activePathname === t.url,
        o = xt(this.props.currentPathname, t);

      return f(
          "li", {
        class: `menu-desktop__item ${(this.state.activePathname!==null?s:o)?"menu-desktop__item--active":""}`,
        ref: o ? this.currentItemRef : void 0,
        onMouseEnter: i => this.handleItemMouseEnter(i, t.url)
      },
          t.items && t.items.length ? f("details", {
        class: "details-reset"
      },

              f("summary", {
        onClick: i => this.handleSummaryClick(i, t.url)
      },
                  f("span", null, t.title)),
              f("div", {
        class: "menu-desktop__submenu-container"
      },
                  f("ul", {
        class: "menu-desktop__submenu list-reset"
      },
                      t.items.map(i => f("li", null, f("a", {
        href: i.url
      },
                          i.title)))))) : f("a", {
        href: t.url
      },
              t.title))
    }))))
  }
};
var Mt = class extends T {
  constructor(e) {
    super(e);
    this.handleUrlChange = this.handleUrlChange.bind(this), this.state = {
      currentPathname: this.props.pathname
    }
  }
  componentDidMount() {
    C.on("router.url-changed", this.handleUrlChange)
  }
  componentWillUnmount() {
    C.off("router.url-changed", this.handleUrlChange)
  }
  handleUrlChange() {
    this.setState({
      currentPathname: window.location.pathname
    })
  }
  render() {
    return f(ge, {
      currentPathname: this.state.currentPathname
    })
  }
};
O(Mt, "menu-desktop", ["pathname"]);

function yt(n) {
  return f("mad-modal", {
    open: !0
  }, f("div", {
    class: "modal-container"
  }, f("draggable-element", {
    class: "modal"
  }, f("div", {
    class: "modal-header applet-header applet-header--solid"
  }, f("a", {
    class: "modal-header__close-button",
    href: "/team",
    "data-noscroll": !0
  }, f("svg", {
    class: "modal-header__icon",
    xmlns: "http://www.w3.org/2000/svg",
    width: "13",
    height: "13",
    viewBox: "0 0 13 13",
    fill: "none"
  }, f("circle", {
    cx: "6.5",
    cy: "6.5",
    r: "6.5",
    fill: "#F36060"
  }), f("g", {
    class: "modal-header__icon--close"
  }, f("rect", {
    x: "3",
    y: "6",
    width: "7",
    height: "1",
    rx: "0.5",
    fill: "#612626",
    transform: "rotate(45, 6.5, 6.5)"
  }), f("rect", {
    x: "3",
    y: "6",
    width: "7",
    height: "1",
    rx: "0.5",
    fill: "#612626",
    transform: "rotate(-45, 6.5, 6.5)"
  })))), f("p", {
    class: "modal-header__title"
  }, n.name)), f("article", null, f("section", {
    class: "modal-col"
  }, f("img", {
    class: "modal-col__img",
    src: `/media/500/${n.image}`,
    alt: ""
  }), f("span", {
    class: "modal-col__links"
  }, n.links.map(e => f("a", {
    class: "btn-stroke",
    href: e.url
  }, e.title)))), f("section", {
    class: "modal-col"
  }, f("h2", {
    class: "c-black bold"
  }, n.name), f("h3", {
    class: "text-small bold"
  }, n.role), f("p", {
    class: "text-small mt-16"
  }, n.bio))))))
}
var an = {},
  At = class extends T {
    constructor(e) {
      super(e);
      this.handleOpenModal = this.handleOpenModal.bind(this), this.handleCloseModal = this.handleCloseModal.bind(this), this.handleEscape = this.handleEscape.bind(this), this.state = {
        shownPerson: this.props.handle || null
      }
    }
    componentDidMount() {
      C.on("team-modal.open", this.handleOpenModal), C.on("team-modal.close", this.handleCloseModal), document.addEventListener("keydown", this.handleEscape), setTimeout(() => {
        requestAnimationFrame(() => {
          if (this.state.shownPerson && window.innerWidth < 768) {
            let e = document.getElementById(`team-cell-${this.state.shownPerson}`);
            e && e.scrollIntoView({
              behavior: "smooth"
            })
          }
        })
      })
    }
    componentWillUnmount() {
      C.off("team-modal.open", this.handleOpenModal), C.off("team-modal.close", this.handleCloseModal), document.removeEventListener("keydown", this.handleEscape)
    }
    handleOpenModal(e) {
      this.setState({
        shownPerson: e
      })
    }
    handleCloseModal() {
      this.setState({
        shownPerson: null
      })
    }
    handleEscape(e) {
      window.innerWidth < 768 || (e.key === "Escape" || e.key === "Esc") && this.state.shownPerson && history.back()
    }
    render() {
      return this.state.shownPerson ? f(yt, I({
        key: this.state.shownPerson
      }, an[this.state.shownPerson])) : null
    }
  };
O(At, "modal-team", ["handle"]);
var wt = `attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,
  _t = `uniform float uTime;
uniform vec3 uBackgroundColor;
uniform vec3 uForegroundColor;
varying vec2 vUv;

float random(vec2 p) {
  return fract(sin(dot(p.xy, vec2(10.09898, 0.233))) * 12000.5453);
}

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.414214;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

void main() {
  float t_offset = uTime * 1.5;
  vec4 foregroundColor = vec4(uForegroundColor, 1.0);
  vec4 backgroundColor = vec4(uBackgroundColor, 1.0);
  vec2 cellRowCol = vec2(vUv.x / 0.5, vUv.y / 0.5);
  vec4 gradientNoise = vec4(0.75 * cos(t_offset / 2.0 + vUv.y * 2.0 + cos(vUv.y * (2.0 * sin(t_offset / 20.0)) + t_offset / 5.0 + Perlin2D(cellRowCol) + cos(vUv.x * 2.0 * (2.0 * sin(t_offset / 40.0)) + t_offset / 10.0) + Perlin2D(cellRowCol))));
  vec4 color = mix(foregroundColor, backgroundColor, clamp(gradientNoise + random(gl_FragCoord.xy * 3.0) / 10.0, 0.0, 1.0));
  gl_FragColor = color;
}
`;
var ln = `#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
#else
precision highp float;
#endif

`,
  ve = !1;
addEventListener("mousedown", () => {
  ve = !0
});
addEventListener("mouseup", () => {
  ve = !1
});
var Et = location.pathname !== "/";
C.on("router.url-changed", () => {
  Et = location.pathname !== "/"
});
var Lt = class extends HTMLElement {
  connectedCallback() {
    setTimeout(() => {
      this.start()
    })
  }
  start() {
    let e = document.createElement("canvas"),
      t = e.getContext("webgl");
    this.appendChild(e);

    function s() {
      e.width = window.innerWidth, e.height = window.innerHeight, e.style.width = window.innerWidth + "px", e.style.height = window.innerHeight + "px", t.viewport(0, 0, window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", s), s();
    let o = t.createShader(t.VERTEX_SHADER);
    t.shaderSource(o, wt), t.compileShader(o);
    let i = t.createShader(t.FRAGMENT_SHADER);
    t.shaderSource(i, ln + _t), t.compileShader(i);
    let a = t.createProgram();
    t.attachShader(a, o), t.attachShader(a, i), t.linkProgram(a), t.useProgram(a);
    let m = t.getUniformLocation(a, "uTime"),
      D = t.getUniformLocation(a, "uBackgroundColor"),
      b = t.getUniformLocation(a, "uForegroundColor"),
      r = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, r), t.bufferData(t.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2]), t.STATIC_DRAW);
    let h = t.getAttribLocation(a, "position"),
      g = t.getAttribLocation(a, "uv");
    t.vertexAttribPointer(h, 2, t.FLOAT, !1, 4 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT), t.vertexAttribPointer(g, 2, t.FLOAT, !1, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT), t.enableVertexAttribArray(h), t.enableVertexAttribArray(g), t.uniform3f(D, .9529411764705882, .6705882352941176, .4549019607843137), t.uniform3f(b, .9764705882352941, .8431372549019608, .8117647058823529);
    let p = 15,
      y = 0,
      v = 0,
      x = 0,
      M = 1e3 / p,
      l = .025 * (60 / p);

    function d(c) {
      requestAnimationFrame(d), !Et && (ve || (x = c - y, x > M && (y = c - x % M, t.uniform1f(m, l * v++), t.drawArrays(t.TRIANGLES, 0, 3))))
    }
    requestAnimationFrame(d)
  }
};
customElements.define("mad-wallpaper", Lt);
var kt = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.toggle = e => {
      e.preventDefault(), this.details.open ? this.closeSubmenu() : this.openSubmenu()
    };
    this.openSubmenu = () => {
      this.details.open = !0, this.container.classList.add("enter"), requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.container.classList.remove("enter")
        })
      })
    };
    this.closeSubmenu = () => {
      this.container.classList.add("exit"), this.container.addEventListener("transitionend", () => {
        this.container.classList.remove("exit"), this.details.open = !1, this.summary.blur()
      }, {
        once: !0
      })
    };
    this.handleContainerClick = e => {
      e.composedPath().some(t => t.tagName === "A") && this.closeSubmenu()
    }
  }
  connectedCallback() {
    this.details = this.querySelector("details"), this.summary = this.querySelector("summary"), this.container = this.querySelector("div"), this.summary.addEventListener("click", this.toggle), this.container.addEventListener("click", this.handleContainerClick)
  }
  disconnectedCallback() {
    this.summary.removeEventListener("click", this.toggle), this.container.removeEventListener("click", this.handleContainerClick)
  }
};
customElements.define("popup-button", kt);
var be = class extends T {
  constructor(e) {
    super(e);
    this.goBack = () => {
      this.setState({
        isOnDetail: !1
      })
    };
    this.openNote = e => {
      this.setState({
        isOnDetail: !0,
        selectedNote: e
      })
    };
    this.state = {
      isOnDetail: !1,
      selectedNote: null
    }
  }
  render() {
    return f("div", {
      class: "applet applet--notes applet--size-medium notes"
    }, f("header", {
      class: "applet-header applet-header--solid"
    }, f("h3", {
      class: "visually-hidden"
    }, this.props.appHeader), f("p", {
      "aria-hidden": "true"
    }, this.props.appHeader)), f("div", {
      class: `notes__panes ${this.state.isOnDetail?"notes__panes--is-on-detail":""}`
    }, f("div", {
      class: "notes__pane notes__pane--summary"
    }, f("h3", {
      class: "notes__heading text-h3"
    }, this.props.appTitle), f("ul", {
      class: "notes__container list-reset"
    }, this.props.items.map(e => f("li", null, f("button", {
      class: "note__button",
      onClick: () => this.openNote(e)
    }, f("article", {
      class: "note"
    }, f("h3", null, f(St, {
      emoji: e.icon
    }), " ", e.title), f("p", null, e.summary))))))), f("div", {
      class: "notes__pane notes__pane--detail"
    }, f("div", {
      class: "notes__heading"
    }, f("button", {
      class: "notes__back-button",
      onClick: this.goBack,
      tabIndex: this.state.isOnDetail ? void 0 : -1
    }, f(cn, null), "All notes")), f("div", {
      class: "notes__container"
    }, this.state.selectedNote !== null && f("article", {
      class: "note flow"
    }, f("h3", null, f(St, {
      emoji: this.state.selectedNote.icon
    }), " ", this.state.selectedNote.title), f("div", {
      class: "flow",
      dangerouslySetInnerHTML: {
        __html: this.state.selectedNote.body
      }
    }), this.state.selectedNote.link && f("a", {
      href: this.state.selectedNote.link.url,
      class: "note__tag"
    }, this.state.selectedNote.link.title))))))
  }
};

function St(n) {
  return f("span", {
    role: "presentation",
    "aria-hidden": "true"
  }, n.emoji)
}

function cn() {
  return f("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none"
  }, f("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M15.5371 21.5928L6.29215 12.6788C5.90262 12.3036 5.90262 11.6974 6.29215 11.3212L15.5371 2.40715C16.0995 1.86428 17.0144 1.86428 17.5777 2.40715C18.14 2.95003 18.14 3.8311 17.5777 4.37397L9.66913 12.0005L17.5777 19.6251C18.14 20.1689 18.14 21.05 17.5777 21.5928C17.0144 22.1357 16.0995 22.1357 15.5371 21.5928",
    fill: "#909096"
  }))
}
var Tt = class extends HTMLElement {
  connectedCallback() {
    K(f(be, I({}, JSON.parse(this.querySelector("script").textContent))), this)
  }
};
customElements.define("mad-notes", Tt);
var Ct = class extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this)
  }
  connectedCallback() {
    this.button = this.querySelector("button"), this.button.addEventListener("click", this.handleClick)
  }
  disconnectedCallback() {
    this.button.removeEventListener("click", this.handleClick)
  }
  handleClick() {
    let e = /iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1,
      [t, s] = [53.52450608969469, -113.5270369961268],
      o = `?q=${t},${s}`;
    e ? window.open(`maps://${o}`) : window.open(`http://maps.google.com/maps${o}`)
  }
};
customElements.define("mad-navigator", Ct);
var dn = ["a[href]:not([tabindex='-1'])", "area[href]:not([tabindex='-1'])", "input:not([disabled]):not([tabindex='-1'])", "select:not([disabled]):not([tabindex='-1'])", "textarea:not([disabled]):not([tabindex='-1'])", "button:not([disabled]):not([tabindex='-1'])", "iframe:not([tabindex='-1'])", "[tabindex]:not([tabindex='-1'])", "[contentEditable=true]:not([tabindex='-1'])"],
  hn = 9;

function Pt(n) {
  return n.tabIndex >= 0 && !n.disabled && un(n)
}

function un(n) {
  return !n.hidden && (!n.type || n.type !== "hidden") && (n.offsetWidth > 0 || n.offsetHeight > 0)
}

function mn(n) {
  return Array.from(n.querySelectorAll(dn.join(","))).filter(Pt)
}
var It = class extends HTMLElement {
  constructor() {
    super();
    this.bindKeypress = this.bindKeypress.bind(this), this.show = this.show.bind(this), this.hide = this.hide.bind(this)
  }
  static get observedAttributes() {
    return ["open"]
  }
  get open() {
    return this.hasAttribute("open")
  }
  set open(e) {
    e ? this.setAttribute("open", "") : this.removeAttribute("open")
  }
  attributeChangedCallback(e, t, s) {
    this.open ? requestAnimationFrame(() => {
      this.show()
    }) : requestAnimationFrame(() => {
      this.hide()
    })
  }
  disconnectedCallback() {
    this.open && this.hide()
  }
  show() {
    document.addEventListener("keydown", this.bindKeypress), this.lastActiveElement = document.activeElement, this.hasAttribute("role") || this.setAttribute("role", "dialog"), this.setAttribute("aria-hidden", "false"), this.setAttribute("aria-modal", "true");
    let e = Array.from(this.querySelectorAll("[autofocus]")).filter(Pt)[0];
    e || (e = this, this.setAttribute("tabindex", "-1")), e.focus({
      preventScroll: !0
    })
  }
  hide() {
    document.removeEventListener("keydown", this.bindKeypress), this.hasAttribute("role") && this.removeAttribute("role"), this.hasAttribute("aria-modal") && this.removeAttribute("aria-modal"), this.setAttribute("aria-hidden", "true"), this.lastActiveElement instanceof HTMLElement && this.lastActiveElement.focus({
      preventScroll: !0
    })
  }
  bindKeypress(e) {
    if (!(e.key === "Tab" || e.keyCode === hn)) return;
    let t = mn(this),
      s = t.indexOf(document.activeElement);
    e.shiftKey && s === 0 ? (t[t.length - 1].focus(), e.preventDefault()) : !e.shiftKey && s === t.length - 1 && (t[0].focus(), e.preventDefault())
  }
};
customElements.define("mad-modal", It);
var pn = "",
  Ht = `
                                    AAA
                                 MMAAAAAAA
                                MMAA   MAAAM
                                AAA       AAAM
                                ADDDD     AAAMMM
                                MADDDDDD   AAAAM
                                 AADDD D    AAAMM
                                 MAADDDDD    AAAMM
                                 M AADDDD D   AA M
                                  MAAADD DDD  AAAM
                                  MAAADDDDDD  AAAM
                                  AAADDDD DDDDAAAM
                                  MAADDDD  DDDAAAM
                                 MMA DDD  DD AAAAM
                                 AADDDDD  D AAMMMM
                                MADDDDDDDD AAMMMMM       MMMMMMM
                                ADDDDD    AAMMMMMMMMMMMMMMMMMMMMMMMMMMM
                               ADDDD     AAMMMAAAAAAAAAAAAAAAAAAAAAAAAAMMM
                              ADDDDD   AAAAAAAA                       AAAAMMMM
                             ADDDDD   MAAA                       D DDDDD AAAA MMM
                           MMDD DD   AAA        DDDDDDDDD          DDDDDDDD AAA MM
                         MAAAD  D    DDDDDD       DD  D  DDDDDDA  DDDDDDDD    AAAMM
                       MMAA DDD   DDDDDD DDD          DDDDD DDDDDD DDDDDDDDD    AAM
      AAMM           MMMAA DDDDDDDDD             DDDDDDDDD    DDMAAADDDDDDD  DDDDM
    MMMAAAAAMMMMMMMMMAAA DDD   DDD   DDDDDD DDDDDD       D     MMMMMAAAAADDDDDAAMM
   MM AAAAAAAAAAAAAAAAADDD    D      D DDD D       D DDDDDDD D DD DDMDDMMAAAAAAMM
  MMDDDDDDD AAAAA  DDDD             D        DDDDDDDD            DDDD DDDDMMMMM
 MMDDD    DDDDDDDDD                   D  D DDDDDDDD                DDDDD  DDD MM
 MD D                      DDDD  D DD      DDDDDDDDDD  DDDDDD    DDDDDDDDDD DDDDMM
MMDDD        DD DDD                         DDDDDDD       DDDDDDDDDD         D D M
MDDD   DDDDDDDDDDDDD            DDDDDDDDDDDDDDDDDDDDDDD     DDDDDDDDDDD DDDDDD D M
M DD   DD     DD DDDDD    DDDDD D DDDD  D     DDDD D DD DD     MM AADDDDDDDDDDDD M
DDDD   DDDDDDDDDDDDDD DD  D  D D D D D   DDDDD DDDDDD DDDDD     MMMMMMAAAAAAAAA MM
DMDDDDDDD          DD D D DDDDDDDDDDDDDDDD DD   DDD  DDDDDDD    DDDMDDDMMMMMMMMMMM
DDADD  DDDDDDDDDDDDDDDDDDDDDDDDDDD  D  DD D DDD     D DDDDDDD   DDDDDDDDDMMMMMMMM
 DAADD      DDDDDDDDDDDDD DDDDDDDDDD          DDD DDD DDD  DDDDDDDDDDDD  MMMM
 MMAA DDDDDD DDD   DDDDDDDDDDDDDDDDD DDDDDDDDDD  DDDDDDDDDDDDD DDD D DDDDD  MMM
  M AADDDDDDDDDDDDDDD  DDD DDDDDDDD          DDDDDDDD DDDDAAMDDDDDD  DDDDDDDDDMM
  MMAAAAAAAAADDADDDDDDDDDDDDDDDDDD DDDDDD  DDDDDD    DDDDDDDMMMMAADDDDDDDDDDDDMM
   MMAAAAAAAAAAAAAAAAAAAAADDDDDDDDDDDDDDDDDDDD   DD      D DDDMMMMMMMMDDDDDDDAM
    MMAAAAAAAAAAAAAAAAAAAAAAAADDDDDDDDDDDDDDDDDD DD D D DDDDD  MMMMMMMMMMMMMM
     MAAAAAAAAAAAAMAMMMMAAAAAAAAAAD DDDDDD  DDDDDDDD   DD DDDDDDD    MMMMMM
      MMAAAAAAMMMMMMMMMMMMMMMAAAAAAAAADDDDDDDDDDDD DDDD      D DDDD       MMMMM
       MMAAMMMMMM MMMMMMMMMMMMMMMMMMMMMMAAAAAAAADDDDDD DDDDDDDDD   DDDDDDD    MMMMMM
         MMMMMMMMMM                MMMMMMMMMMMMMM DDAADDAAAADDDDDDDDD DDDDDDDD      DMMM
                                           MMMMMMMMMMMMMMAAAAAAAAAAAADDDDDDDDDDDDD   DDMMM
                                                MMMMMMMMMMMMMMMMMAAAAAAAAAADDADDDDDDD D  M
                                                           MMMMMMMMMMMMMMMMAAAAAAAAADDDMMM
                                                                   MMMMMMMMMMMMMMMMMMMMMM
                                                                           MMMMMMMMMMMMM
`,
  Rt = "Thanks.",
  xi = {
    home_page_url: `${pn}/engineering`,
    title: "MAD Engineering Blog",
    description: "A RSS news feed containing the latest MAD Engineering articles.",
    copyright: `Contents and compilations published on these websites by the providers are subject to German copyright laws. Reproduction, editing, distribution as well as the use of any kind outside the scope of the copyright law require a written permission of the author or originator. Downloads and copies of these websites are permitted for private use only.
	The commercial use of our contents without permission of the originator is prohibited. Copyright laws of third parties are respected as long as the contents on these websites do not originate from the provider. Contributions of third parties on this site are indicated as such. However, if you notice any violations of copyright law, please inform us. Such contents will be removed immediately.`,
    language: "en-us",
    feedLinks: {
      json: "https://www.mad.ac/feed.json",
      atom: "https://www.mad.ac/feed.xml"
    },
    icon: "https://mad.ac/favicon.svg",
    favicon: "https://mad.ac/favicon.ico"
  };
var fn = ["font-family: Courier, 'Courier New', 'Lucida Sans Typewriter', monospace"].join(";"),
  Dn = ["display: inline-block", "font-size: 10px", "padding-top: 10px", "padding-bottom: 10px", "font-family: Verdana, Arial, Helvetica, sans-serif"].join(";");
console.log(`%c${Ht}`, fn);
console.log(`%c${Rt}`, Dn);
var xe = new IntersectionObserver(n => {
    for (let e of n) e.isIntersecting && e.target.load()
  }, {
    rootMargin: "50% 0%"
  }),
  $t = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.img = null
    }
    connectedCallback() {
      this.img = this.querySelector("img"), this.img && xe.observe(this)
    }
    disconnectedCallback() {
      xe.unobserve(this)
    }
    load() {
      xe.unobserve(this), this.img && (this.img.dataset.srcset && (this.img.srcset = this.img.dataset.srcset, delete this.img.dataset.srcset), this.img.dataset.src && (this.img.src = this.img.dataset.src, delete this.img.dataset.src))
    }
  };
customElements.define("lazy-image", $t);
