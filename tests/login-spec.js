describe('Protractor Demo App', function() {
  it('should have a title', function() {
    browser.get('http://localhost:8080/login');

 //   expect(browser.getTitle()).toEqual('Super Calculator');
    expect(browser.getTitle()).toEqual('Envite');
  });
});
