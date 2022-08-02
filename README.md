## Current functionality:

* Assigns a label from `total` based on total PRs merged
    * Bucket values represent ‘more than x merged PRs’
        * ex. [0, 5, 10]: 1-5 PRs merged falls in the first bucket, 6-10 in the next, and 11+ in the last
        * There is no upper cap
* Assigns a label from `hotlist` based on placement on the 'hotlist'
    * 'hotlist' is all users ranked by merged PRs in the last `days` number of days
    * Bucket values represent how many people get each label
        * ex. [1, 2, 2]: user with the most merged PRs recently gets the first label, the next 2 people get a separate label, and the next two the last label, other users do not get the label
            * i.e. 1, 2-3, 4-5
* Comments are written for each label assigned
    * Body of the comment is half handwritten, half generated
        * generates the username
        * generates a string from `label-meanings` corresponding to the label


