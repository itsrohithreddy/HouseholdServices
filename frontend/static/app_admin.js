import AdminHome from "./components/admin_home.js"
import AdminNavbar from "./components/admin_navbar.js"
import AdminSignin from "./components/admin_signin.js"
import AdminSignOut from "./components/admin_signout.js"
// import AdminRedirect from "./components/admin_redirect.js"
import Redirect from "./components/redirect.js"
import AdminDetails from "./components/admin_details.js"
import Profile from "./components/profile.js"
import ProfSrvcsHistory from "./components/profSrvcsHistory.js"
import ProfSrvcReqs from "./components/profSrvcReqs.js"
import AdminSrvcCatReg from "./components/admin_srvcCatReg.js"
import AdminApprovals from "./components/admin_approvals.js"


// Use Vuex and VueRouter
Vue.use(Vuex);
Vue.use(VueRouter);

const store = new Vuex.Store({
    state : {

    },
    // mutations are used to change state
    // `commit` a mutation to change state
    // Must be synchronous
    mutations : {
        incr(state,n) {

        }
    },
    // Asynchronous
    actions : {
        incr({commit,state},n) {
            commit('incr' , n);
        }
    }
})
// this.$store available within all components
// mutations
// this.$store.commit('incr',10) or
// this.$store.commit({
//  type : 'incr',
//  n : 10
// })
// actions(asynchronous)
//this.$store.dispatch('increment',10)


const routes = [
    { path: "/", component: AdminHome },
    { path: "/admin_signin", component: AdminSignin },
    // { path: "/signup", component: Signup },
    { path: "/redirect/:message/:status", component: Redirect},
    { path: "/admin_details/:entity", component: AdminDetails},
    { path: "/profile/:id", component: Profile},
    { path : "/prof_pendReqs/:id", component : ProfSrvcReqs},
    { path : "/prof_srvcs/:id", component : ProfSrvcsHistory},
    { path : "/srvcregister", component : AdminSrvcCatReg},
    { path : "/admin_signout",component : AdminSignOut},
    { path : "/admin_profApprovals",component : AdminApprovals},
];
  
const router = new VueRouter({
    routes,
});
  
var app_admin = new Vue({
    el: "#app_admin",
    router: router,
    store: store,
    components : {
        Navbar : AdminNavbar,
    }
});