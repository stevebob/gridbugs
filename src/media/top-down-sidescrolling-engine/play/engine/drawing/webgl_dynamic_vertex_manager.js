function WebGLDynamicVertexManager(glm, stack_size) {
    this.glm = glm;
    
    // initialize dynamic buffers and allocate memory
    this.vertex_buffer = this.glm.array_buffer(2).bind().allocate_dynamic(8192);
    this.dynamic_index_buffer = this.glm.element_buffer();

    TransformStack.call(this, stack_size);
}
WebGLDynamicVertexManager.inherits_from(WebGLVertexManager);

