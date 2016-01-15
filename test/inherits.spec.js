import chai from 'chai';
import decorate from '../src/inherits';

let expect = chai.expect;

describe('Decorator', () => {

  it('should be a function', () => {
    expect(decorate).to.be.a('function');
  });

  it('should throw if not passed a constructor to decorate', () => {
    let test = () => decorate();
    expect(test).to.throw(Error, /constructor to decorate/);
  });

  it('should not return anything', () => {
    expect(decorate({})).to.be.undefined;
  });

  it('should decorate the constructor with a static method', () => {
    let ctor = () => null;
    decorate(ctor);
    expect(ctor).to.have.ownProperty('inherits');
  });

  describe('static inherits method', () => {

    let Base;
    let Model;

    beforeEach(() => {

      Base = class {
        static schema = {
          properties: {
            base: {
              type: Boolean,
            },
          },
          relationships: {
            relation: {
              type: 'relation',
            },
          },
          hooks: {
            onCreate() {
              this.base = true;
            },
          },
        };
      };

      Model = class {
        static schema = {
          properties: {
            test: {
              type: String,
            },
          },
          relationships: {
            child: {
              type: 'child',
            },
          },
        };
      };

      decorate(Model);
      Model.inherits(Base);
    });

    it('should throw if no subclass constructor is provided', () => {
      let test = () => Model.inherits();
      expect(test).to.throw(Error, /constructor to inherit/);
    });

    it('should merge the superclass schema with the subclass schema', () => {
      expect(Model.schema.properties).to.deep.equal({
        base: { type: Boolean },
        test: { type: String },
      });
    });

    it('should merge the superclass relationships with the subclass relationships', () => {
      expect(Model.schema.relationships).to.deep.equal({
        relation: { type: 'relation' },
        child: { type: 'child' },
      });
    });

    it('should not affect the superclass schema', () => {
      expect(Base.schema.properties).to.deep.equal({
        base: {
          type: Boolean,
        },
      });
    });

    it('should not affect the superclass relationships', () => {
      expect(Base.schema.relationships).to.deep.equal({
        relation: { type: 'relation' },
      });
    });

    it('should add superclass hooks to the subclass when the subclass has none', () => {
      expect(Model.schema.hooks).to.have.property('onCreate');
    });

    it('should merge the superclass and subclass hooks when both are defined', () => {
      let Base = class {
        static schema = {
          properties: {},
          hooks: {
            onCreate() {
              this.sup = 1;
            },
          },
        };
      };
      let Model = class {
        static schema = {
          properties: {},
          hooks: {
            onCreate() {
              this.sub = 1;
            },
          },
        };
      };
      decorate(Model);
      Model.inherits(Base);

      expect(Model.schema.hooks.onCreate).to.be.an('array').and.have.length(2);
    });
  });
});
