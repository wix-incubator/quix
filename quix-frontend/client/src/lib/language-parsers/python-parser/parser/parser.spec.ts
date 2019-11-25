import {expect} from 'chai';
import {getPythonErrors} from './';

describe('python parser', () => {
  it('should pass leagal code:', () => {
    const code = `
def greet(name):
  print ('Hello', name)
greet('Jack')
greet('Jill')
greet('Bob')
`;
    const errors = getPythonErrors(code);
    expect(errors).to.eqls([]);
  });

  it('should handle indent error:', () => {
    const code = `
def greet(name):
print ('Hello', name)
greet('Jack')
greet('Jill')
greet('Bob')
`;
    const errors = getPythonErrors(code);
    expect(errors.length).to.be.greaterThan(0);
    expect(errors[0]).to.eql({column: 0, row: 2, text: `missing INDENT at 'print'`, type: 'error'});
  });
});
