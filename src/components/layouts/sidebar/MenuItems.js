import masterIcon from '../../../../public/images/database.svg';
import centerIcon from '../../../../public/images/centers.svg';
import dashboardIcon from '../../../../public/images/dashboard.svg';
import userIcon from '../../../../public/images/group.svg';
import { TeamLeaders, classes, coursePlanner, masters, showClasses, showCoursePlanner, showLearners, showManageUsers, showMasters, showTeamLeaders, showfacilitator } from '../../../../app.config';



// 


const Menuitems = [
  // {
  //   title: "SIDEBAR.DASHBOARD",
  //   icon: dashboardIcon,
  //   href: "/dashboard",
  // },
  showClasses && {
    title: "SIDEBAR.CENTERS",
    icon: centerIcon,
    href: "/centers",
  },
  showManageUsers && {
    title: "SIDEBAR.MANAGE_USERS",
    icon: userIcon,
    //  href: "/",
    subOptions: [
      showTeamLeaders && {
        title: "SIDEBAR.TEAM_LEADERS",
        href: "/teamLeader",
      },
      showfacilitator && {
        title: "SIDEBAR.TEACHERS",
        href: "/facilitator",
      },
      showLearners && {
        title: "SIDEBAR.STUDENTS",
        href: "/learners",
      },
    ],
  },



  showMasters && {
    title: "Master ",
    icon: masterIcon,
    // href: "/",
    subOptions: [
      /*{
        title: "State",
        href: "/state",
      },*/
      {
        title: "Cluster",
        href: "/cluster",
      },
      {
        title: "School",
        href: "/school",
      },
      {
        title: "Class",
        href: "/class",
      },
      // {
      //   title: "Slot",
      //   href: "/slot",
      // },
    ],
  },
  showCoursePlanner && {
    title: "SIDEBAR.COURSE_PLANNER",
    icon: coursePannerIcon,
    href: "/course-planner",
    subOptions: [
      {
        title: "SIDEBAR.FOUNDATION_COURSE",
        href: "/course-planner/foundation",
      },
      // {
      //   title: "SIDEBAR.MAIN_COURSE",
      //   href: "/mainCourse",
      // },
    ],
  },
];

export default Menuitems;
