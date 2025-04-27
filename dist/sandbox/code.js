import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// Define the getCanvasElements function
async function getCanvasElements() {
  try {
    console.log("Getting canvas elements...");
    
    // Get the current artboard/page
    const currentContext = editor.context;
    console.log("Current context available:", !!currentContext);
    
    if (!currentContext || !currentContext.insertionParent) {
      console.log("No valid context or insertion parent");
      return [];
    }
    
    const insertionParent = currentContext.insertionParent;
    console.log("Insertion parent available:", !!insertionParent);
    
    // Check if children collection exists
    if (!insertionParent.children) {
      console.log("No children collection found");
      return [];
    }
    
    // Get the length of the children collection
    const childCount = insertionParent.children.length;
    console.log("Child count:", childCount);
    
    // Convert to array and extract needed properties
    const result = [];
    
    // Use a safer approach to iterate through children
    try {
      // First try to get all children as an array
      const allChildren = Array.from(insertionParent.children);
      console.log("Successfully converted children to array:", allChildren.length);
      
      // Process each child
      allChildren.forEach((element, index) => {
        try {
          console.log(`Processing element ${index}`);
          result.push({
            id: (element.id !== undefined) ? element.id : `element-${index}`,
            type: (element.type !== undefined) ? element.type : "unknown",
          });
        } catch (err) {
          console.error(`Error processing element at index ${index}:`, err);
        }
      });
    } catch (arrayError) {
      console.log("Could not convert to array, trying alternative approach:", arrayError);
      
      // Alternative approach: iterate using at() method
      for (let i = 0; i < childCount; i++) {
        try {
          console.log(`Trying to access element at index ${i}`);
          // Use a safer way to access the element
          let element;
          try {
            element = insertionParent.children.at(i);
          } catch (e) {
            console.log(`at() method failed for index ${i}, trying direct access`);
            element = insertionParent.children[i];
          }
          
          if (element) {
            // Safely extract properties
            let id = "unknown-id";
            let type = "unknown";
            
            try { id = element.id || `element-${i}`; } catch (e) { console.log("Could not access id"); }
            try { type = element.type || "unknown"; } catch (e) { console.log("Could not access type"); }
            
            result.push({ id, type });
          }
        } catch (err) {
          console.error(`Error processing element at index ${i}:`, err);
        }
      }
    }
    
    console.log("Final result:", result);
    return result;
  } catch (error) {
    console.error("Error getting canvas elements:", error);
    return [];
  }
}

function start() {
    // APIs to be exposed to the UI runtime
    const sandboxApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;

            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };

            // Define rectangle color.
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },
        
        // Add the getCanvasElements function to the exposed API
        getCanvasElements: getCanvasElements
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
