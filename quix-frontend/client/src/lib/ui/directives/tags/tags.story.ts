import {inject} from '../../../core';

export default app => app
  .story('UI', 'Tags')
    .section('Tags', `
      <bi-tags
        ng-non-bindable
        style="width: 500px;"
        bi-options="tag for tag in ::['one', 'two', 'three']"
        ng-model="tags"
        placeholder="Add a tag"
      ></bi-tags>

      <output>tags: {{tags}}</output>

      <bi-tags
        ng-non-bindable
        bi-options="tag for tag in ::['one', 'two', 'three']"
        bt-options="::{freetext: true}"
        ng-model="tagsfreetext"
        placeholder="Add a tag (freetext)"
      ></bi-tags>

      <output>tagsfreetext: {{tagsfreetext}}</output>

      <bi-tags
        ng-non-bindable
        bi-options="tag for tag in ::['one', 'two', 'three']"
        bt-options="::{freetext: true, autocomplete: false}"
        ng-model="tagsfreetextnoac"
        placeholder="Add a tag (freetext + noautocomplete)"
      ></bi-tags>

      <output>tagsfreetext: {{tagsfreetextnoac}}</output>

      <bi-tags
        ng-non-bindable
        bi-options="tag for tag in ::['one', 'two', 'three']"
        ng-model="tagsdisabled"
        placeholder="I'm disabled"
        readonly="true"
      ></bi-tags>

      <output>tagsrequired: {{tagsrequired}}</output>

      <bi-tags
        ng-non-bindable
        bi-options="tag for tag in ::['one', 'two', 'three']"
        ng-model="tagsrequired"
        placeholder="I'm required"
        required="true"
      ></bi-tags>
    `).section('Tags deferred', `
      <bi-tags
        ng-non-bindable
        style="width: 500px;"
        bi-options="tag as tag.title for tag in promise"
        ng-model="deferredTags"
        on-input-change="onInputChange()"
        placeholder="Add a tag"
      ></bi-tags>
    `, scope => {
      scope.onInputChange = () => scope.promise = inject('$timeout')(() => {
        return [{title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}];
      }, 2000);
    });
