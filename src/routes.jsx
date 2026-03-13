import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CustomerDashboard from './components/customer/CustomerDashboard';
import IntakeForm from './components/customer/IntakeForm';
import TeamDashboard from './components/team/TeamDashboard';
import IntakeDetail from './components/team/IntakeDetail';
import StartReview from './components/review/StartReview';
import ViewReview from './components/review/ViewReview';
import RoleRedirect from './components/RoleRedirect';

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AppLayout>
      <Switch location={location}>
        <Route exact path="/" component={RoleRedirect} />
        <Route exact path="/customer" component={CustomerDashboard} />
        <Route exact path="/customer/new" component={IntakeForm} />
        <Route exact path="/customer/edit/:id" component={IntakeForm} />
        <Route exact path="/team" component={TeamDashboard} />
        <Route exact path="/team/intake/:id" component={IntakeDetail} />
        <Route exact path="/team/review/:id/view" component={ViewReview} />
        <Route exact path="/team/review/:id" component={StartReview} />
        <Redirect to="/" />
      </Switch>
    </AppLayout>
  );
}
