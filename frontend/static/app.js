
import Home from "./components/home.js";
import Signin from "./components/signin.js";
import Signup from "./components/signup.js";
import Navbar from "./components/navbar.js";
import Redirect from "./components/redirect.js";
import Profile from "./components/profile.js";
import ProfRegistration from "./components/profRegistration.js";
import SignOut from "./components/signout.js";
// import Notification from "./components/notification.js";
import ProfSrvcReqs from "./components/profSrvcReqs.js"
import ProfSrvcsHistory from "./components/profSrvcsHistory.js";

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
    { path: "/", component: Home },
    { path: "/signin", component: Signin },
    { path: "/signup", component: Signup },
    { path: "/redirect/:message/:status", component: Redirect},
    { path: "/profile", component: Profile},
    { path : "/profregister", component : ProfRegistration},
    { path : "/signout",component : SignOut},
    {path : "/prof_pendReqs", component : ProfSrvcReqs},
    {path : "/prof_srvcs", component : ProfSrvcsHistory}
];
  
const router = new VueRouter({
    routes,
});
  
var app = new Vue({
    el: "#app",
    router: router,
    store: store,
    components : {
        Navbar,
    }
});