The core transformer that creates reflect metadata per class to handle initializations, dependency injections, decorator tags, implementations.

Documentation is partially hand written, partially generated. Allows for implementations such as Start, Initialize, Thread, and more. See the nindo-framework example to see how it works entirely.
This is a product based transformer that has worked in creating numerous projects.

```ts
// Due to this class implementing Start & Initialize it will add reflection via the transformer
// The framework will then register this as a controller or service.
class ExampleController implements Start, Initalize {
  // Automatically passes dependencies when compiled for controllers. During compiling
  // reflection meta is registered.
  constructor(private dependency : Example2Controller) {
    // Dependencies are passed within constructor.
  }

  // Runs after initialization, dependencies are resolved at this state 
  Start() {
     
  }

  // Runs prewarming, after reflection is registered alongside meta.
  Initalize() {
    
  }
}
```
