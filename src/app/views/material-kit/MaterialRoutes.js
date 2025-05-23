import { lazy } from 'react';
import Loadable from 'app/components/Loadable';

const SearchClientPage = Loadable(lazy(() => import('./client/SearchClientPage')));
const AddClientPage = Loadable(lazy(() => import('./client/AddClientPage')));
const MemberSetupPage = Loadable(lazy(() => import('./client/AddClientPage')));
const UpdateClientInfoTemplate = Loadable(lazy(() => import('../my-group/UpdateClientInfoTemplate')));
const AppForm = Loadable(lazy(() => import('./forms/AppForm')));
const AppButton = Loadable(lazy(() => import('./buttons/AppButton')));
const AppIcon = Loadable(lazy(() => import('./icons/AppIcon')));
const AppProgress = Loadable(lazy(() => import('./AppProgress')));
const AppMenu = Loadable(lazy(() => import('./menu/AppMenu')));
const AppCheckbox = Loadable(lazy(() => import('./checkbox/AppCheckbox')));
const AppSwitch = Loadable(lazy(() => import('./switch/AppSwitch')));
const AppRadio = Loadable(lazy(() => import('./radio/AppRadio')));
const AppSlider = Loadable(lazy(() => import('./slider/AppSlider')));
const AppDialog = Loadable(lazy(() => import('./dialog/AppDialog')));
const AppSnackbar = Loadable(lazy(() => import('./snackbar/AppSnackbar')));
const AppAutoComplete = Loadable(lazy(() => import('./auto-complete/AppAutoComplete')));
const AppExpansionPanel = Loadable(lazy(() => import('./expansion-panel/AppExpansionPanel')));

const materialRoutes = [
  { path: '/client/list', element: <SearchClientPage /> },
  { path: '/my-group/client-template', element: <UpdateClientInfoTemplate/>},
  { path: '/client/add', element: <AddClientPage /> },
  { path: '/material/form', element: <AppForm /> },
  { path: '/material/buttons', element: <AppButton /> },
  { path: '/material/icons', element: <AppIcon /> },
  { path: '/material/progress', element: <AppProgress /> },
  { path: '/material/menu', element: <AppMenu /> },
  { path: '/material/checkbox', element: <AppCheckbox /> },
  { path: '/material/switch', element: <AppSwitch /> },
  { path: '/material/radio', element: <AppRadio /> },
  { path: '/material/slider', element: <AppSlider /> },
  { path: '/material/autocomplete', element: <AppAutoComplete /> },
  { path: '/material/expansion-panel', element: <AppExpansionPanel /> },
  { path: '/material/dialog', element: <AppDialog /> },
  { path: '/material/snackbar', element: <AppSnackbar /> }
];

export default materialRoutes;
