
function getRelationStyle(relation) {
  const relationInfo = fields.relation.valuesMap[relation]
  if (relationInfo && relationInfo.color) {
    return {
      border: '4px solid ' + relationInfo.color
    };
  } else {
    return {};
  }
}

const DefaultCard = ({item}) => {

  return (
          <div data-id={item.id} className="mosaic-wrap" key={item.id}>
            <div className={classNames('mosaic', {nonoss : item.oss === false})} style={getRelationStyle(item.relation)}
              <div className="logo_wrapper">
                <img src={item.href} className='logo' max-height='100%' max-width='100%' alt={item.name} />
              </div>
              <div className="mosaic-info">
                <div className="mosaic-title">
                  <h5>{item.name}</h5>
                  {item.organization}
                </div>
                <div className="mosaic-stars">
                  { _.isNumber(item.stars) && item.stars &&
                      <div>
                        <StarIcon color="disabled" style={{ fontSize: 15 }}/>
                        <span style={{position: 'relative', top: -3}}>{item.starsAsText}</span>
                      </div>
                  }
                  { Number.isInteger(item.amount) &&
                      <div className="mosaic-funding">{item.amountKind === 'funding' ? 'Funding: ': 'MCap: '} {'$'+ millify( item.amount )}</div>
                  }
                </div>
              </div>
            </div>
          </div>
  );
}
