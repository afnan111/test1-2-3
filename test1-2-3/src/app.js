import React from 'react';
 

function App() {
 
  return (
    <Container fluid >
      <Header></Header>
      <Container>
        <BrowserRouter>
          <Switch> 
            <Route path="/dashboard"> </Route> 
            <Route ><Notfound /></Route>
          </Switch>
        </BrowserRouter>
      </Container>
    </Container>
  );
}

export default App;
