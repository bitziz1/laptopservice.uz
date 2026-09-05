export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const BuildsPartsFragmentDoc = gql`
    fragment BuildsParts on Builds {
  __typename
  title
  purpose
  purposeLabel
  date
  description
  components {
    __typename
    cpu
    motherboard
    ram
    gpu
    storage
    psu
    case
    cooler
  }
  complexity
  tags
  heroImage
  gallery
  body
}
    `;
export const CasesPartsFragmentDoc = gql`
    fragment CasesParts on Cases {
  __typename
  title
  device
  category
  date
  problem
  diagnosis
  solution
  result
  tags
  heroImage
  gallery
  captions
  keySpecs {
    __typename
    label
    value
  }
  schemaType
  summaryForSocial
  body
}
    `;
export const ThreadsPartsFragmentDoc = gql`
    fragment ThreadsParts on Threads {
  __typename
  handle
  date
  gallery
  alts
  url
  video
  body
}
    `;
export const ReviewsPartsFragmentDoc = gql`
    fragment ReviewsParts on Reviews {
  __typename
  author
  source
  rating
  date
  device
  avatar
  gallery
  captions
  body
}
    `;
export const BuildsDocument = gql`
    query builds($relativePath: String!) {
  builds(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...BuildsParts
  }
}
    ${BuildsPartsFragmentDoc}`;
export const BuildsConnectionDocument = gql`
    query buildsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: BuildsFilter) {
  buildsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...BuildsParts
      }
    }
  }
}
    ${BuildsPartsFragmentDoc}`;
export const CasesDocument = gql`
    query cases($relativePath: String!) {
  cases(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...CasesParts
  }
}
    ${CasesPartsFragmentDoc}`;
export const CasesConnectionDocument = gql`
    query casesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: CasesFilter) {
  casesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...CasesParts
      }
    }
  }
}
    ${CasesPartsFragmentDoc}`;
export const ThreadsDocument = gql`
    query threads($relativePath: String!) {
  threads(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ThreadsParts
  }
}
    ${ThreadsPartsFragmentDoc}`;
export const ThreadsConnectionDocument = gql`
    query threadsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ThreadsFilter) {
  threadsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ThreadsParts
      }
    }
  }
}
    ${ThreadsPartsFragmentDoc}`;
export const ReviewsDocument = gql`
    query reviews($relativePath: String!) {
  reviews(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ReviewsParts
  }
}
    ${ReviewsPartsFragmentDoc}`;
export const ReviewsConnectionDocument = gql`
    query reviewsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ReviewsFilter) {
  reviewsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ReviewsParts
      }
    }
  }
}
    ${ReviewsPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    builds(variables, options) {
      return requester(BuildsDocument, variables, options);
    },
    buildsConnection(variables, options) {
      return requester(BuildsConnectionDocument, variables, options);
    },
    cases(variables, options) {
      return requester(CasesDocument, variables, options);
    },
    casesConnection(variables, options) {
      return requester(CasesConnectionDocument, variables, options);
    },
    threads(variables, options) {
      return requester(ThreadsDocument, variables, options);
    },
    threadsConnection(variables, options) {
      return requester(ThreadsConnectionDocument, variables, options);
    },
    reviews(variables, options) {
      return requester(ReviewsDocument, variables, options);
    },
    reviewsConnection(variables, options) {
      return requester(ReviewsConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
